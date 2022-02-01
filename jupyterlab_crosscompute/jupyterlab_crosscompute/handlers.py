import json
import subprocess
import tornado

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
        PROCESS_BY_PATH[path] = subprocess.Popen([
            'crosscompute', '--host', host, '--port', str(port), path])
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


PROCESS_BY_PATH = {}
