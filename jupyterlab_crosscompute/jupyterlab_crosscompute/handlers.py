import atexit
import json
import requests
import subprocess
import tornado
from crosscompute.constants import Error
from crosscompute.exceptions import (
    CrossComputeConfigurationNotFoundError, CrossComputeError)
from crosscompute.routines.automation import DiskAutomation
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from logging import getLogger
from os.path import basename, relpath
from pathlib import Path
from shutil import rmtree
from tempfile import mkdtemp

from .constants import BASE_URI, ID_LENGTH, NAMESPACE
from .macros import find_open_port, get_unique_id, terminate_process
from .routines import get_automation_dictionary, get_log_dictionary


class LaunchHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        relative_folder = self.get_argument('folder').strip('/ ')
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
        relative_folder = self.get_argument('folder').strip('/ ')
        try:
            state = LAUNCH_STATE_BY_FOLDER[relative_folder]
            uri = state['uri']
        except KeyError:
            request = self.request
            headers = request.headers
            port = find_open_port()
            origin = headers['Origin']
            if 'X-Forwarded-For' in headers:
                # TODO: Accept other proxies
                server_id = get_unique_id(ID_LENGTH, [basename(_[
                    'base_uri']) for _ in LAUNCH_STATE_BY_FOLDER.values()])
                base_uri = f'{BASE_URI}/{server_id}'
                requests.post(
                    'http://localhost:6000/api/routes' + base_uri,
                    json={'target': f'http://localhost:{port}'})
                uri = f'{origin}{base_uri}'
            else:
                base_uri = ''
                uri = f'http://{request.host_name}:{port}'
            log_path = FOLDER_BY_NAME['launch'] / f'{port}.log'
            process = subprocess.Popen([
                'crosscompute',
                '--host', self.settings['serverapp'].ip or '*',
                '--port', str(port),
                '--no-browser', '--base-uri', base_uri, '--origins', origin,
            ], cwd=relative_folder, start_new_session=True, stdout=open(
                log_path, 'wt'), stderr=subprocess.STDOUT)
            LAUNCH_STATE_BY_FOLDER[relative_folder] = {
                'base_uri': base_uri, 'uri': uri, 'log_path': log_path,
                'process': process}
        self.finish(json.dumps({'uri': uri}))

    @tornado.web.authenticated
    def delete(self):
        relative_folder = self.get_argument('folder').strip('/ ')
        try:
            state = LAUNCH_STATE_BY_FOLDER[relative_folder]
        except KeyError:
            self.set_status(404)
        else:
            base_uri = state['base_uri']
            if base_uri:
                requests.delete('http://localhost:6000/api/routes' + base_uri)
            process = state['process']
            terminate_process(process.pid)
            del LAUNCH_STATE_BY_FOLDER[relative_folder]
        self.finish(json.dumps({}))


class LogHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        log_type = self.get_argument('type').strip()
        relative_folder = self.get_argument('folder').strip('/ ')
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
        (url_path_join(base_url, NAMESPACE, 'log'), LogHandler),
    ])
    root_folder = FOLDER_BY_NAME['root'] = Path(mkdtemp())
    launch_folder = FOLDER_BY_NAME['launch'] = root_folder / 'launch'
    launch_folder.mkdir()
    atexit.register(clean)


def clean():
    for state in LAUNCH_STATE_BY_FOLDER.values():
        process = state['process']
        process_id = process.pid
        terminate_process(process_id)
        L.debug('terminating process %s for %s', process.pid, state)
    rmtree(FOLDER_BY_NAME['root'])


LAUNCH_STATE_BY_FOLDER = {}
FOLDER_BY_NAME = {}
L = getLogger(__name__)
