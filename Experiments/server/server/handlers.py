import json

from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join
import tornado

class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post, 
    # patch, put, delete, options) to ensure only authorized user can request the 
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            "data": "This is /server/get_example endpoint!"
        }))


class DataHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            "data": "This is /server/get_example endpoint!1"
        }))


def setup_handlers(web_app):
    host_pattern = ".*$"
    
    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "server", "get_example")
    data_pattern = url_path_join(base_url, "server", "data")
    handlers = [
        (route_pattern, RouteHandler),
        (data_pattern, DataHandler),
    ]
    web_app.add_handlers(host_pattern, handlers)
