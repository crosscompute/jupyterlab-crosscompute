import json
import tornado
import concurrent.futures
from queue import Queue
from crosscompute.constants import AUTOMATION_FILE_NAME
from crosscompute.exceptions import (
    CrossComputeDefinitionError,
    CrossComputeExecutionError)
from crosscompute.routines import load_relevant_path, run_automation
from invisibleroads_macros_security import make_random_string
from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join


LOG_ID_LENGTH = 256
QUEUE_BY_LOG_ID = {}


class PrintsHandler(APIHandler):

    @tornado.web.authenticated
    def post(self):
        '''
        path = self.get_argument('path')
        try:
            automation_definition = load_relevant_path(
                path, AUTOMATION_FILE_NAME, ['automation'])
            d = run_automation(automation_definition, is_mock=False)
            self.finish(json.dumps({'url': d['url']}))
        except (
            CrossComputeDefinitionError,
            CrossComputeExecutionError,
        ) as e:
            self.set_status(400)
            self.finish(str(e))
        except (Exception, SystemExit) as e:
            self.set_status(500)
            self.finish(str(e))
        '''
        path = self.get_argument('path')
        log_id = make_random_string(LOG_ID_LENGTH)

        '''
        from tornado.ioloop import PeriodicCallback
        import time

        def get_next():
            EVENTS_BY_LOG_ID[log_id] = EVENTS_BY_LOG_ID.get(log_id, []) + [{
                'x': time.time()}]

        checker = PeriodicCallback(lambda: get_next(), 1000)
        checker.start()
        '''

        QUEUE_BY_LOG_ID[log_id] = queue = Queue()

        def work():
            try:
                automation_definition = load_relevant_path(
                    path, AUTOMATION_FILE_NAME, ['automation'])
                d = run_automation(automation_definition, is_mock=False)
                queue.put({'url': d['url']})
                print('WE ARE DONE', d)
            except (
                CrossComputeDefinitionError,
                CrossComputeExecutionError,
            ) as e:
                queue.put({'error': str(e)})
            except (Exception, SystemExit) as e:
                queue.put({'error': str(e)})
            
        
        executor = concurrent.futures.ThreadPoolExecutor()
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
