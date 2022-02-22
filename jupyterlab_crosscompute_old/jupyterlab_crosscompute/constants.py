from os import getenv


NAMESPACE = 'jupyterlab-crosscompute'
MINIMUM_PORT = int(getenv('CROSSCOMPUTE_MINIMUM_PORT', 1024))
MAXIMUM_PORT = int(getenv('CROSSCOMPUTE_MAXIMUM_PORT', 65535))
BASE_URI = getenv('CROSSCOMPUTE_BASE_URI', '')
