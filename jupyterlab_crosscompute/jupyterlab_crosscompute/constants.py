from enum import IntEnum


class Error(IntEnum):

    CONFIGURATION_NOT_FOUND = -100


NAMESPACE = 'crosscompute'
MINIMUM_PORT = 1024
MAXIMUM_PORT = 65535
