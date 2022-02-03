import json
import tornado
from crosscompute.exceptions import (
    CrossComputeConfigurationNotFoundError, CrossComputeError)
from crosscompute.routines.automation import Automation
from crosscompute.scripts.serve import serve
from multiprocessing import Process
from os.path import dirname

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

from .constants import Error, NAMESPACE
from .macros import find_open_port


class RouteHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        folder = self.get_argument('folder').strip() or '.'
        try:
            automation = Automation.load(folder)
        except CrossComputeConfigurationNotFoundError as e:
            self.set_status(404)
            return self.finish(json.dumps({
                'message': str(e),
                'code': Error.CONFIGURATION_NOT_FOUND}))
        except CrossComputeError as e:
            self.set_status(422)
            return self.finish(json.dumps({'message': str(e)}))
        configuration_path = automation.path
        configuration = automation.configuration
        # TODO: Define a function to generate this JSON
        automation_dictionary = {
            'path': configuration_path,
            'folder': dirname(configuration_path),
            'name': configuration.get('name', ''),
            'version': configuration.get('version', ''),
        }
        if 'batches' in configuration:
            batch_definitions = []
            for batch_dictionary in configuration['batches']:
                batch_definition = {
                    'name': batch_dictionary.get('name', ''),
                    'folder': batch_dictionary['folder'],
                }
                batch_configuration = batch_dictionary.get('configuration', {})
                if 'path' in batch_configuration:
                    batch_definition['configuration'] = {
                        'path': batch_configuration['path']}
                batch_definitions.append(batch_definition)
            automation_dictionary['batches'] = batch_definitions
        return self.finish(json.dumps(automation_dictionary))

    @tornado.web.authenticated
    def post(self):
        settings = self.settings
        host = settings['serverapp'].ip
        port = find_open_port()
        folder = self.get_argument('folder').strip() or '.'
        try:
            automation = Automation.load(folder)
        except CrossComputeError as e:
            self.set_status(422)
            return self.finish(json.dumps({'message': str(e)}))

        server_process = Process(target=serve, args=(
            automation, host, port), kwargs={'with_browser': False},
            daemon=True)
        processes = [server_process]
        for process in processes:
            process.start()
        PROCESSES_BY_FOLDER[folder] = processes

        # TODO: Use proxy to get uri if a proxy is available
        uri = f'{self.request.protocol}://{self.request.host_name}:{port}'
        self.finish(json.dumps({
            'uri': uri,
        }))


def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    web_app.add_handlers(host_pattern, [
        (url_path_join(base_url, NAMESPACE, 'launch'), RouteHandler),
    ])


PROCESSES_BY_FOLDER = {}
