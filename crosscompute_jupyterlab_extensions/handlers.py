import json
import tornado
from concurrent.futures import ThreadPoolExecutor
from crosscompute.constants import AUTOMATION_FILE_NAME
from crosscompute.exceptions import (
    CrossComputeDefinitionError,
    CrossComputeExecutionError)
from crosscompute.routines import load_relevant_path, run_automation
from invisibleroads_macros_security import make_random_string
from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join
from queue import Queue


LOG_ID_LENGTH = 256
QUEUE_BY_LOG_ID = {}


class PrintsHandler(APIHandler):

    @tornado.web.authenticated
    def post(self):
        path = self.get_argument('path')
        while True:
            log_id = make_random_string(LOG_ID_LENGTH)
            if log_id not in QUEUE_BY_LOG_ID:
                break
        queue = QUEUE_BY_LOG_ID[log_id] = Queue()
        def log(x):
            queue.put(x)

        def work():
            try:
                automation_definition = load_relevant_path(
                    path, AUTOMATION_FILE_NAME, ['automation'])
                d = run_automation(
                    automation_definition, is_mock=False, log=log)
                queue.put({'url': d['url']})
            except CrossComputeDefinitionError as e:
                queue.put({'error': e.args[0], })
                # TODO: Decide error format
                # TODO: Capture error type
                {'error': {'x': 1}}
            except CrossComputeExecutionError as e:
                queue.put({'error': e.args[0]})
            except (Exception, SystemExit) as e:
                queue.put({'error': str(e)})
        
        executor = ThreadPoolExecutor()
        executor.submit(work)


        self.finish({'id': log_id})


class LogsHandler(APIHandler):

    def initialize(self):
        super().initialize()
        self.set_header('content-type', 'text/event-stream')
        self.set_header('cache-control', 'no-cache')

    @tornado.web.authenticated
    @tornado.gen.coroutine
    def get(self, log_id):
        yield tornado.gen.sleep(10)
        # exit when it gets signal from queue
        # loop while queue is empty
        # publish if it is not empty
        while True:
            try:
                queue = QUEUE_BY_LOG_ID[log_id]
            except KeyError:
                yield tornado.gen.sleep(1)
            else:
                while not queue.empty():
                    data = queue.get()
                    # TODO: Exit when it gets signal from queue
                    yield self.publish(json.dumps(data))

    @tornado.gen.coroutine
    def publish(self, data):
        try:
            self.write('data: {}\n\n'.format(data))
            yield self.flush()
        except tornado.iostream.StreamClosedError:
            pass


def setup_handlers(web_app):
    host_pattern = '.*$'
    namespace_url = url_path_join(web_app.settings['base_url'], 'crosscompute')
    web_app.add_handlers(host_pattern, [
        (url_path_join(namespace_url, 'prints'), PrintsHandler),
        (url_path_join(namespace_url, 'logs', '(.*)'), LogsHandler),
    ])
