import json
import tornado

from crosscompute.constants import Error
from crosscompute.exceptions import (
    CrossComputeConfigurationNotFoundError, CrossComputeError)
from crosscompute.routines.automation import DiskAutomation
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from os.path import relpath

from .constants import NAMESPACE
from .routines import get_automation_dictionary


class LaunchHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        relative_folder = self.get_argument('folder').strip('/ ')
        try:
            automation = DiskAutomation.load(relative_folder)
        except CrossComputeConfigurationNotFoundError as e:
            self.set_status(404)
            return self.finish(json.dumps({
                'message': str(e),
                'code': Error.CONFIGURATION_NOT_FOUND}))
        except CrossComputeError as e:
            self.set_status(422)
            d = {'message': str(e)}
            if hasattr(e, 'path'):
                d['path'] = relpath(e.path)
            return self.finish(json.dumps(d))
        automation_dictionary = get_automation_dictionary(
            automation, LAUNCH_STATE_BY_FOLDER)
        return self.finish(json.dumps(automation_dictionary))


class LogHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({'text': ''}))


def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    web_app.add_handlers(host_pattern, [
        (url_path_join(base_url, NAMESPACE, 'launch'), LaunchHandler),
        # (url_path_join(base_url, NAMESPACE, 'log'), LogHandler),
    ])


LAUNCH_STATE_BY_FOLDER = {}
