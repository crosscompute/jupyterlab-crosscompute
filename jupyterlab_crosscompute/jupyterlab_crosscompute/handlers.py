import json
import subprocess
import tornado
from os.path import realpath

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

from .constants import NAMESPACE


class RouteHandler(APIHandler):

    @tornado.web.authenticated
    def post(self):
        path = self.get_argument('path')
        # TODO: Call python directly
        # TODO: Launch async process
        subprocess.call(['crosscompute', path])
        self.finish(json.dumps({
            'data': realpath(path),
            'uri': 'http://127.0.0.1:7000',
        }))


def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    web_app.add_handlers(host_pattern, [
        (url_path_join(base_url, NAMESPACE, 'launch'), RouteHandler),
    ])
