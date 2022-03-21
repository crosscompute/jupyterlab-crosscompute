from os import getenv


NAMESPACE = 'jupyterlab-crosscompute'
ID_LENGTH = 16
BASE_URI = getenv('CROSSCOMPUTE_LAUNCH_BASE_URI', '')
PROXY_URI = 'http://localhost:6000/api/routes'
