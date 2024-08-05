import json
import time
import tornado
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

from crosscompute.exceptions import (
    CrossComputeConfigurationNotFoundError, CrossComputeError)
from crosscompute.routines.automation import DiskAutomation


class RouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        path = self.get_argument('path')
        print(path)
        from pathlib import Path
        p = Path(path)
        try:
            a = DiskAutomation.load(p)
        except CrossComputeConfigurationNotFoundError as e:
            d = {'error': str(e)}
            print(e)
        except CrossComputeError as e:
            d = {'error': str(e)}
            print(e)
        else:
            c = a.configuration
            d = {'name': c.get('name', ''), 'version': c.get('version', '')}
        '''
        self.finish(json.dumps({
            'path': path.upper(),
        }))
        '''
        time.sleep(3)
        self.finish(json.dumps(d))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(
        base_url, "jupyterlab-crosscompute", "get-example")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
