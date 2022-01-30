import json
import subprocess
import tornado
from crosscompute.scripts.launch import do as launch
from multiprocessing import Process

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

from .constants import NAMESPACE


class RouteHandler(APIHandler):

    @tornado.web.authenticated
    def post(self):
        path = self.get_argument('path')

        def start():
            # TODO: Make host depend on jupyterlab ip
            # TODO: Consider whether to auto find available port
            subprocess.run(['pkill', 'crosscompute'])
            launch(['--host', '0.0.0.0', path])

        p = Process(target=start)
        p.start()
        self.finish(json.dumps({
            'uri': 'http://127.0.0.1:7000',
        }))


def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    web_app.add_handlers(host_pattern, [
        (url_path_join(base_url, NAMESPACE, 'launch'), RouteHandler),
    ])
