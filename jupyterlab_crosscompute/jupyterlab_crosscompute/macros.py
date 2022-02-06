import os
import signal
from crosscompute.macros.web import is_port_in_use
from random import randint

from .constants import MAXIMUM_PORT, MINIMUM_PORT


def find_open_port(minimum_port=MINIMUM_PORT, maximum_port=MAXIMUM_PORT):
    while True:
        port = randint(minimum_port, maximum_port)
        if not is_port_in_use(port):
            break
    return port


def terminate_process(process_id):
    signal_process(process_id, signal.SIGTERM)


def signal_process(process_id, signal_code):
    os.killpg(os.getpgid(process_id), signal_code)
