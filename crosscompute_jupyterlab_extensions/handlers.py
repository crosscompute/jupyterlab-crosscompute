import json
import tornado
from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join


class RouteHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            'data': 'whee here and there and everywhere!'
        }))


def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    route_pattern = url_path_join(
        base_url, 'crosscompute-jupyterlab-extensions', 'get_example')
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
