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
        google_zip_file_uri = 'https://storage.googleapis.com/crosscompute-20200929/example-20200929.zip'
        self.finish(json.dumps({
            "url": google_zip_file_uri
        }))


def setup_handlers(web_app):
    host_pattern = ".*$"
    
    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "notebook-download-button", "download")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
