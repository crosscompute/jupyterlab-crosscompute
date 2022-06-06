from os import getenv


NAMESPACE = 'jupyterlab-crosscompute'
ID_LENGTH = 16
ROOT_URI = getenv('CROSSCOMPUTE_ROOT_URI', '')
PROXY_URI = 'http://localhost:6000/api/routes'
