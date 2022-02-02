import json
import tornado
from crosscompute.exceptions import CrossComputeError
from crosscompute.routines.automation import Automation
from crosscompute.scripts.serve import serve
from multiprocessing import Process

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

from .constants import NAMESPACE
from .macros import find_open_port


class RouteHandler(APIHandler):

    @tornado.web.authenticated
    def post(self):
        settings = self.settings
        host = settings['serverapp'].ip
        port = find_open_port()
        path = self.get_argument('path')
        try:
            automation = Automation.load(path)
        except CrossComputeError as e:
            self.set_status(422)
            return self.finish(json.dumps({'message': str(e)}))

        server_process = Process(target=serve, args=(
            automation, host, port), kwargs={'with_browser': False},
            daemon=True)
        processes = [server_process]
        for process in processes:
            process.start()
        PROCESSES_BY_PATH[path] = processes

        # TODO: Use proxy to get uri if a proxy is available
        uri = f'{self.request.protocol}://{self.request.host_name}:{port}'
        self.finish(json.dumps({
            'uri': uri,
        }))


def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    web_app.add_handlers(host_pattern, [
        (url_path_join(base_url, NAMESPACE, 'launch'), RouteHandler),
    ])


PROCESSES_BY_PATH = {}
