from os import getenv


NAMESPACE = 'jupyterlab-crosscompute'
PROXY_URI = getenv(
    'CROSSCOMPUTE_PROXY_URI', 'http://localhost:6000/api/routes')
ROOT_PATH = getenv(
    'CROSSCOMPUTE_ROOT_PATH', '')
ID_LENGTH = 16
