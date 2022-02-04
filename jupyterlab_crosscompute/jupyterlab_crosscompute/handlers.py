# import atexit
import json
import tornado
from crosscompute.exceptions import (
    CrossComputeConfigurationNotFoundError, CrossComputeError)
from crosscompute.routines.automation import Automation
from crosscompute.scripts.serve import serve
from multiprocessing import Process

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

from .constants import Error, NAMESPACE
from .macros import find_open_port
from .routines import get_automation_dictionary


class RouteHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        folder = self.get_argument('folder').strip() or '.'
        try:
            automation = Automation.load(folder)
        except CrossComputeConfigurationNotFoundError as e:
            self.set_status(404)
            return self.finish(json.dumps({
                'message': str(e),
                'code': Error.CONFIGURATION_NOT_FOUND}))
        except CrossComputeError as e:
            self.set_status(422)
            return self.finish(json.dumps({'message': str(e)}))
        automation_dictionary = get_automation_dictionary(
            automation, LAUNCH_STATE_BY_FOLDER)
        return self.finish(json.dumps(automation_dictionary))

    @tornado.web.authenticated
    def post(self):
        settings = self.settings
        host = settings['serverapp'].ip
        port = find_open_port()
        folder = self.get_argument('folder').strip() or '.'
        try:
            automation = Automation.load(folder)
        except CrossComputeError as e:
            self.set_status(422)
            return self.finish(json.dumps({'message': str(e)}))
        server_process = Process(target=serve, args=(
            automation, host, port), kwargs={'with_browser': False})
        processes = [server_process]
        # TODO: Add run processes
        for process in processes:
            process.start()
        # TODO: Use proxy to get uri if a proxy is available
        uri = f'{self.request.protocol}://{self.request.host_name}:{port}'
        LAUNCH_STATE_BY_FOLDER[folder] = {'uri': uri, 'processes': processes}
        self.finish(json.dumps({
            'uri': uri,
        }))


def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    web_app.add_handlers(host_pattern, [
        (url_path_join(base_url, NAMESPACE, 'launch'), RouteHandler),
    ])


'''
def stop_processes():
    for state in LAUNCH_STATE_BY_FOLDER.values():
        for process in state['processes']:
            process.close()
            process
'''


LAUNCH_STATE_BY_FOLDER = {}
# atexit.register(stop_processes)
