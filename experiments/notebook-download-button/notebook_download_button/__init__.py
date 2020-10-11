from ._version import __version__ 
from .handlers import setup_handlers


def _jupyter_server_extension_paths():
    return [{
        "module": "notebook_download_button"
    }]


def load_jupyter_server_extension(lab_app):
    setup_handlers(lab_app.web_app)
