import json
import tornado
from crosscompute.temporaries import run
from crosscompute.exceptions import (
    CrossComputeDefinitionError, CrossComputeExecutionError, CrossComputeError)
from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join


class RouteHandler(APIHandler):

    @tornado.web.authenticated
    def post(self):
        path = self.get_argument('path')
        try:
            url = run(path)
            self.finish(json.dumps({ 'url': url }))
        except (
            CrossComputeError,
            CrossComputeDefinitionError,
            CrossComputeExecutionError
        ) as e:
            self.set_status(400)
            self.finish(str(e))
        except Exception as e:
            self.set_status(500)
            self.finish(str(e))


def setup_handlers(web_app):
    host_pattern = '.*$'
    namespace_url = url_path_join(web_app.settings['base_url'], 'crosscompute')
    web_app.add_handlers(host_pattern, [
        (url_path_join(namespace_url, 'prints'), RouteHandler),
    ])
