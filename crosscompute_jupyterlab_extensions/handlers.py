import json
import tornado
from concurrent.futures import ThreadPoolExecutor
from crosscompute.constants import AUTOMATION_FILE_NAME
from crosscompute.routines import load_relevant_path, run_automation
from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join
from queue import Queue
from tornado.ioloop import IOLoop

from .macros import get_unique_id


LOG_ID_LENGTH = 64
QUEUE_BY_LOG_ID = {}


class PrintsHandler(APIHandler):

    @tornado.web.authenticated
    async def post(self):
        path = self.get_argument('path')
        log_id = get_unique_id(LOG_ID_LENGTH, QUEUE_BY_LOG_ID)
        queue = QUEUE_BY_LOG_ID[log_id] = Queue()

        def log(d):
            print(d)
            queue.put({'type': 'UPDATE', 'data': d})

        def work():
            try:
                automation_definition = load_relevant_path(
                    path, AUTOMATION_FILE_NAME, ['automation'])
                d = run_automation(
                    automation_definition, is_mock=False, log=log)
                queue.put({'type': 'DOWNLOAD', 'data': {'location': d['url']}})
                # !!!
                print(d)
            except (Exception, SystemExit) as e:
                queue.put({'type': 'ALERT', 'data': e.args[0]})

        self.finish({'id': log_id})
        await IOLoop.current().run_in_executor(None, work)


class LogsHandler(APIHandler):

    @tornado.web.authenticated
    async def get(self, log_id):
        self.set_header('content-type', 'text/event-stream')
        self.set_header('cache-control', 'no-cache')
        try:
            queue = QUEUE_BY_LOG_ID[log_id]
        except KeyError:
            raise tornado.web.HTTPError(404)
        while True:
            while not queue.empty():
                d = queue.get()
                await self.publish(json.dumps(d))
                if 'payload' in d or 'error' in d:
                    del QUEUE_BY_LOG_ID[log_id]
                    return
            await tornado.gen.sleep(1)

    async def publish(self, data):
        try:
            self.write('data: {}\n\n'.format(data))
            await self.flush()
        except tornado.iostream.StreamClosedError:
            pass


def setup_handlers(web_app):
    host_pattern = '.*$'
    namespace_url = url_path_join(web_app.settings['base_url'], 'crosscompute')
    web_app.add_handlers(host_pattern, [
        (url_path_join(namespace_url, 'prints'), PrintsHandler),
        (url_path_join(namespace_url, 'logs', '(.*)'), LogsHandler),
    ])
