# TODO: Write script to check that ports in range are not being used
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
from os.path import relpath
from pathlib import Path
from shutil import rmtree
from tempfile import mkdtemp

from .constants import BASE_URI, NAMESPACE
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
        folder = self.get_argument('folder').strip() or '.'
        try:
            state = LAUNCH_STATE_BY_FOLDER[folder]
            uri = state['uri']
        except KeyError:
            request = self.request
            headers = request.headers
            origin = headers['Origin']
            settings = self.settings
            port = find_open_port()
            log_path = SERVER_FOLDER_BY_NAME['launch'] / f'{port}.log'

            if 'X-Forwarded-For' in headers:
                # TODO: Accept other proxies
                # TODO: Use random string instead of port
                base_uri = BASE_URI + '/' + str(port)
                requests.post(
                    'http://localhost:6000/api/routes' + base_uri,
                    json={'target': f'http://localhost:{port}'})
                uri = f'{origin}{base_uri}'
            else:
                base_uri = ''
                uri = f'http://{request.host_name}:{port}'

            process = subprocess.Popen([
                'crosscompute',
                '--host', settings['serverapp'].ip or '*',
                '--port', str(port),
                '--no-browser',
                '--origins', origin,
                '--base-uri', base_uri,
            ], cwd=folder, start_new_session=True, stdout=open(
                log_path, 'wt'), stderr=subprocess.STDOUT)
            LAUNCH_STATE_BY_FOLDER[folder] = {
                'uri': uri, 'process': process, 'path': log_path,
                'base_uri': base_uri}
        print(LAUNCH_STATE_BY_FOLDER)
        self.finish(json.dumps({'uri': uri}))

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
        base_uri = state['base_uri']
        if base_uri:
            requests.delete('http://localhost:6000/api/routes' + base_uri)
        del LAUNCH_STATE_BY_FOLDER[folder]
        self.finish(json.dumps({}))


class LogHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        # TODO: Specify which state (i.e. launch) to get
        folder = self.get_argument('folder').strip() or '.'
        try:
            state = LAUNCH_STATE_BY_FOLDER[folder]
        except KeyError:
            self.set_status(404)
            return self.finish(json.dumps({}))
        log_path = state['path']
        with open(log_path, 'rt') as f:
            log_text = f.read()
        self.finish(json.dumps({'text': log_text}))


def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    web_app.add_handlers(host_pattern, [
        (url_path_join(base_url, NAMESPACE, 'launch'), LaunchHandler),
        (url_path_join(base_url, NAMESPACE, 'log'), LogHandler),
    ])
    SERVER_FOLDER_BY_NAME['launch'] = Path(mkdtemp())
    atexit.register(clean)


def clean():
    for folder, state in LAUNCH_STATE_BY_FOLDER.items():
        process = state['process']
        process_id = process.pid
        terminate_process(process_id)
        L.debug('terminating process %s for %s', process.pid, state)
    for folder in SERVER_FOLDER_BY_NAME.values():
        rmtree(folder)


L = getLogger(__name__)
LAUNCH_STATE_BY_FOLDER = {}
SERVER_FOLDER_BY_NAME = {}
