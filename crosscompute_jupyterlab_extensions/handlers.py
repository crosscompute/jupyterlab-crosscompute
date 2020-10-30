import json
import tornado
from crosscompute.temporaries import run
from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join


class RouteHandler(APIHandler):

    @tornado.web.authenticated
    def post(self):
        path = self.get_argument('path')
        print(path)
        url = run(path)
        print(path, url)
        self.finish(json.dumps({
            'url': url,
        }))


def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    route_pattern = url_path_join(
        base_url, 'crosscompute-jupyterlab-extensions', 'prints')
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
