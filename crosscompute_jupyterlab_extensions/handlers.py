import json
import tornado
import requests
from crosscompute.temporaries import run
from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join


class RouteHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        path = self.get_argument('path', '')
        url = run(path)
        # response = requests.post('https://services.projects.iixyfqfy.crosscompute.com/prints.json', json={'blocks': [], 'styles': []})
        self.finish(json.dumps({
            # 'data': response.json(),
            'url': url,
        }))


'''
_ GET /crosscompute-jupyterlab-extensions/get_example/path
_ GET /crosscompute-jupyterlab-extensions/get_example?path=

_ POST /crosscompute-jupyterlab-extensions/automations/abc/Untitled.ipynb
POST /crosscompute-jupyterlab-extensions/automations?path=abc/Untitled.ipynb
'''


def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    route_pattern = url_path_join(
        base_url, 'crosscompute-jupyterlab-extensions', 'get_example')
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
