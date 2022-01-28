import json
import tornado

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

from .constants import NAMESPACE


class RouteHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            'data': 'This is /jupyterlab-crosscompute/get_example endpoint!'
        }))


def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    web_app.add_handlers(host_pattern, [
        (url_path_join(base_url, NAMESPACE, 'get_example'), RouteHandler),
    ])
