import json
import time
import tornado
from tornado.iostream import StreamClosedError
from tornado.ioloop import IOLoop, PeriodicCallback
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
        d['path'] = str(path)
        self.finish(json.dumps(d))

def add():
    a = 0
    while True:
        yield a
        a += 1

class DataSource(object):
    """Generic object for producing data to feed to clients."""
    def __init__(self, initial_data=None):
        self._data = initial_data
    
    @property
    def data(self):
        return self._data
        
    @data.setter
    def data(self, new_data):
        self._data = new_data

class EventSource(APIHandler):
    """Basic handler for server-sent events."""
    def initialize(self, source):
        """The ``source`` parameter is a string that is updated with
        new data. The :class:`EventSouce` instance will continuously
        check if it is updated and publish to clients when it is.
        """
        self.source = source
        self._last = None
        self.set_header('content-type', 'text/event-stream')
        self.set_header('cache-control', 'no-cache')

    @tornado.gen.coroutine
    def publish(self, data):
        """Pushes data to a listener."""
        try:
            self.write('data: {}\n\n'.format(data))
            yield self.flush()
        except StreamClosedError:
            pass

    @tornado.gen.coroutine
    def get(self):
        while True:
            if self.source.data != self._last:
                yield self.publish(self.source.data)
                self._last = self.source.data
            else:
                yield tornado.gen.sleep(0.005)



def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]

    generator = add()
    publisher = DataSource(next(generator))
    def get_next():
        publisher.data = next(generator)
        print(publisher.data)
    checker = PeriodicCallback(lambda: get_next(), 1000.)
    checker.start()
    
    route_pattern = url_path_join(
        base_url, "jupyterlab-crosscompute", "get-example")
    e_stream_pattern = url_path_join(
        base_url, "jupyterlab-crosscompute", "log-stream")
    handlers = [
        (route_pattern, RouteHandler),
        (e_stream_pattern, EventSource, dict(source=publisher))
    ]
    web_app.add_handlers(host_pattern, handlers)
