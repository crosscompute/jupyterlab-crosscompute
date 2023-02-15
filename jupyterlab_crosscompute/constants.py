from os import getenv


NAMESPACE = 'jupyterlab-crosscompute'
PROXY_URI = getenv(
    'CROSSCOMPUTE_PROXY_URI', 'http://localhost:6000/api/routes')
ROOT_URI = getenv(
    'CROSSCOMPUTE_ROOT_URI', '')
DEBUG_FOLDER = getenv(
    'CROSSCOMPUTE_DEBUG_FOLDER', '')
ID_LENGTH = 16
