import json
import tornado
from crosscompute.constants import AUTOMATION_FILE_NAME
from crosscompute.routines import load_relevant_path, run_automation
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from queue import Queue
from tornado.ioloop import IOLoop

from .constants import NAMESPACE
from .macros import get_unique_id


QUEUE_BY_LOG_ID = {}
LOG_ID_LENGTH = 64


class PrintsHandler(APIHandler):

    @tornado.web.authenticated
    async def post(self):
        path = self.get_argument('path')
        log_id = get_unique_id(LOG_ID_LENGTH, QUEUE_BY_LOG_ID)
        queue = QUEUE_BY_LOG_ID[log_id] = Queue()

        def log(d):
            queue.put({'type': 'PROGRESS', 'data': d})

        def work():
            try:
                automation_definition = load_relevant_path(
                    path, AUTOMATION_FILE_NAME, ['automation'])
                d = run_automation(
                    automation_definition, is_mock=False, log=log)
                queue.put({'type': 'DONE', 'data': {'url': d['url']}})
            except (Exception, SystemExit) as e:
                queue.put({'type': 'ERROR', 'data': e.args[0]})

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
            await tornado.gen.sleep(1)

    async def publish(self, data):
        try:
            self.write('data: {}\n\n'.format(data))
            await self.flush()
        except tornado.iostream.StreamClosedError:
            pass


def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    web_app.add_handlers(host_pattern, [
        (url_path_join(base_url, NAMESPACE, 'prints'), PrintsHandler),
        (url_path_join(base_url, NAMESPACE, 'logs', '(.*)'), LogsHandler),
    ])
