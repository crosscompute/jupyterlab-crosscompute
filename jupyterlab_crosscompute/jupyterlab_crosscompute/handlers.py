# TODO: Write script to check that ports in range are not being used
import atexit
import json
import subprocess
import tornado
from crosscompute.constants import Error
from crosscompute.exceptions import (
    CrossComputeConfigurationNotFoundError, CrossComputeError)
from crosscompute.routines.automation import DiskAutomation
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from logging import getLogger
from os.path import relpath

from .constants import NAMESPACE
from .macros import find_open_port, terminate_process
from .routines import get_automation_dictionary


class LaunchHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        folder = self.get_argument('folder').strip() or '.'
        try:
            automation = DiskAutomation.load(folder)
        except CrossComputeConfigurationNotFoundError as e:
            self.set_status(404)
            return self.finish(json.dumps({
                'message': str(e),
                'code': Error.CONFIGURATION_NOT_FOUND}))
        except CrossComputeError as e:
            self.set_status(422)
            d = {'message': str(e)}
            if hasattr(e, 'path'):
                d['path'] = relpath(e.path)
            return self.finish(json.dumps(d))
        automation_dictionary = get_automation_dictionary(
            automation, LAUNCH_STATE_BY_FOLDER)
        return self.finish(json.dumps(automation_dictionary))

    @tornado.web.authenticated
    def post(self):
        request = self.request
        settings = self.settings
        host = settings['serverapp'].ip
        port = find_open_port()
        folder = self.get_argument('folder').strip() or '.'
        origin = f'{request.protocol}://{request.host}'
        process = subprocess.Popen([
            'crosscompute',
            '--host', host or '*',
            '--port', str(port),
            '--no-browser',
            '--origins', origin,
        ], cwd=folder, start_new_session=True)
        # TODO: Show logs using server sent events
        # TODO: Use proxy to get uri if a proxy is available
        uri = f'{self.request.protocol}://{self.request.host_name}:{port}'
        LAUNCH_STATE_BY_FOLDER[folder] = {'uri': uri, 'process': process}
        self.finish(json.dumps({
            'uri': uri,
        }))

    @tornado.web.authenticated
    def delete(self):
        folder = self.get_argument('folder').strip() or '.'
        try:
            state = LAUNCH_STATE_BY_FOLDER[folder]
        except KeyError:
            self.set_status(404)
            return self.finish(json.dumps({}))
        process = state['process']
        terminate_process(process.pid)
        state['uri'] = ''
        self.finish(json.dumps({}))


def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    web_app.add_handlers(host_pattern, [
        (url_path_join(base_url, NAMESPACE, 'launch'), LaunchHandler),
    ])


def stop_processes():
    for folder, state in LAUNCH_STATE_BY_FOLDER.items():
        process = state['process']
        process_id = process.pid
        terminate_process(process_id)
        L.debug('terminating process %s for %s', process.pid, state)
    '''
    for folder, state in LAUNCH_STATE_BY_FOLDER.items():
        process = state['process']
        process.wait()
    '''


L = getLogger(__name__)
LAUNCH_STATE_BY_FOLDER = {}
atexit.register(stop_processes)
