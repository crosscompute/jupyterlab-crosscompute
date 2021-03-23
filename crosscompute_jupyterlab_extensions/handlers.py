import json
import tornado
from crosscompute.constants import AUTOMATION_FILE_NAME
from crosscompute.routines import load_relevant_path, run_automation
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from queue import Queue
from threading import Lock
from tornado.ioloop import IOLoop

from .constants import NAMESPACE
from .macros import get_unique_id


QUEUE_BY_LOG_ID = {}
LOG_ID_LENGTH = 64
AUTOMATION_LOCK = Lock()


class PrintsHandler(APIHandler):

    @tornado.web.authenticated
    async def post(self):
        if is_locked():
            print('ignoring automation because another is already running')
            self.set_status(409)
            return self.finish(
                'An automation is already running. '
                'Please wait for it to finish before starting a new one.')

        path = self.get_argument('path')
        log_id = get_unique_id(LOG_ID_LENGTH, QUEUE_BY_LOG_ID)
        queue = QUEUE_BY_LOG_ID[log_id] = Queue()
        print(f'opening log {log_id}')

        def log(d):
            queue.put({'type': 'PROGRESS', 'data': d})
            if not is_locked():
                print('aborting automation')
                raise SystemExit({'connection': 'closed'})

        def work():
            try:
                automation_definition = load_relevant_path(
                    path, AUTOMATION_FILE_NAME, ['automation'])
                d = run_automation(
                    automation_definition, is_mock=False, log=log)
                url = d['url']
                # TODO: Consider downloading URL to ~/Downloads/TIMESTAMP.zip
                queue.put({'type': 'DONE', 'data': {'url': url}})
            except (Exception, SystemExit) as e:
                queue.put({'type': 'ERROR', 'data': e.args[0]})

        self.finish({'id': log_id})
        acquire_lock()
        await IOLoop.current().run_in_executor(None, work)


class LogsHandler(APIHandler):

    @tornado.web.authenticated
    async def get(self, log_id):
        self.request.connection.set_close_callback(release_lock)
        self.set_header('content-type', 'text/event-stream')
        self.set_header('cache-control', 'no-cache')
        try:
            queue = QUEUE_BY_LOG_ID[log_id]
        except KeyError:
            raise tornado.web.HTTPError(404)
        try:
            while is_locked():
                print(f'checking log {log_id}')
                while not queue.empty():
                    d = queue.get()
                    await self.publish(json.dumps(d))
                await tornado.gen.sleep(1)
        except tornado.iostream.StreamClosedError:
            pass
        print(f'closing log {log_id}')
        del QUEUE_BY_LOG_ID[log_id]

    async def publish(self, data):
        print(data)
        self.write('data: {}\n\n'.format(data))
        await self.flush()


def acquire_lock():
    print('ACQUIRE AUTOMATION LOCK')
    AUTOMATION_LOCK.acquire()


def is_locked():
    return AUTOMATION_LOCK.locked()


def release_lock():
    print('RELEASE AUTOMATION LOCK')
    AUTOMATION_LOCK.release()


def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    web_app.add_handlers(host_pattern, [
        (url_path_join(base_url, NAMESPACE, 'prints'), PrintsHandler),
        (url_path_join(base_url, NAMESPACE, 'logs', '(.*)'), LogsHandler),
    ])
