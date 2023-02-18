import atexit
import json
import tornado
from crosscompute.constants import Error
from crosscompute.exceptions import (
    CrossComputeConfigurationNotFoundError, CrossComputeError)
from crosscompute.routines.automation import DiskAutomation
from invisibleroads_macros_disk import make_random_folder
from invisibleroads_macros_web.port import find_open_port
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from logging import getLogger
from os.path import relpath
from pathlib import Path
from shutil import rmtree

from .constants import DEBUG_FOLDER, NAMESPACE
from .macros import terminate_process
from .routines import (
    get_automation_dictionary,
    get_log_dictionary,
    make_launch_state,
    remove_proxy_uri)


class LaunchHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        relative_folder = self.get_argument('folder').strip('/ ') or '.'
        try:
            automation = DiskAutomation.load(relative_folder)
        except CrossComputeConfigurationNotFoundError as e:
            self.set_status(404)
            d = {
                'message': str(e),
                'code': Error.CONFIGURATION_NOT_FOUND,
            }
        except CrossComputeError as e:
            self.set_status(422)
            d = {'message': str(e)}
            if hasattr(e, 'path'):
                d['path'] = relpath(e.path)
        else:
            d = get_automation_dictionary(
                automation, LAUNCH_STATE_BY_FOLDER)
        return self.finish(json.dumps(d))

    @tornado.web.authenticated
    def post(self):
        relative_folder = self.get_argument('folder').strip('/ ') or '.'
        try:
            state = LAUNCH_STATE_BY_FOLDER[relative_folder]
            uri = state['uri']
        except KeyError:
            try:
                port = find_open_port()
            except OSError:
                self.set_status(503)
                return self.finish({})
            host = self.settings['serverapp'].ip or '0.0.0.0'
            log_folder = FOLDER_BY_NAME['launch']
            launch_state = make_launch_state(
                self.request, host, port, relative_folder, log_folder,
                LAUNCH_STATE_BY_FOLDER.values())
            LAUNCH_STATE_BY_FOLDER[relative_folder] = launch_state
            uri = launch_state['uri']
        self.finish(json.dumps({'uri': uri}))

    @tornado.web.authenticated
    def delete(self):
        relative_folder = self.get_argument('folder').strip('/ ') or '.'
        try:
            state = LAUNCH_STATE_BY_FOLDER[relative_folder]
        except KeyError:
            self.set_status(404)
        else:
            remove_proxy_uri(state['root_uri'])
            process = state['process']
            terminate_process(process.pid)
            del LAUNCH_STATE_BY_FOLDER[relative_folder]
        self.finish(json.dumps({}))


class LogHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        log_type = self.get_argument('type').strip()
        relative_folder = self.get_argument('folder').strip('/ ') or '.'
        try:
            state_by_folder = {
                'launch': LAUNCH_STATE_BY_FOLDER,
            }[log_type]
            state = state_by_folder[relative_folder]
        except KeyError:
            self.set_status(404)
            d = {}
        else:
            d = get_log_dictionary(state)
        self.finish(json.dumps(d))


def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    web_app.add_handlers(host_pattern, [
        (url_path_join(base_url, NAMESPACE, 'launch'), LaunchHandler),
        (url_path_join(base_url, NAMESPACE, 'log'), LogHandler)])
    root_folder = FOLDER_BY_NAME['root'] = Path(
        DEBUG_FOLDER or make_random_folder())
    launch_folder = FOLDER_BY_NAME['launch'] = root_folder / 'launch'
    launch_folder.mkdir(exist_ok=True)
    atexit.register(clean)


def clean():
    for state in LAUNCH_STATE_BY_FOLDER.values():
        process = state['process']
        process_id = process.pid
        terminate_process(process_id)
        L.debug('terminating process %s for %s', process.pid, state)
    if DEBUG_FOLDER:
        return
    try:
        rmtree(FOLDER_BY_NAME['root'])
    except OSError:
        pass


LAUNCH_STATE_BY_FOLDER = {}
FOLDER_BY_NAME = {}
L = getLogger(__name__)
