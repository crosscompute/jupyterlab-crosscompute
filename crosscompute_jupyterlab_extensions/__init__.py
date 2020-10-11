from ._version import __version__ 
from .handlers import setup_handlers


def _jupyter_server_extension_paths():
    return [{
        'module': 'crosscompute_jupyterlab_extensions'
    }]


def load_jupyter_server_extension(lab_app):
    setup_handlers(lab_app.web_app)
    lab_app.log.info('Registered /crosscompute-jupyterlab-extensions')
