import os
import signal

from invisibleroads_macros_security import make_random_string


def get_unique_id(id_length, old_ids):
    while True:
        new_id = make_random_string(id_length)
        if new_id not in old_ids:
            break
    return new_id


def terminate_process(process_id):
    signal_process(process_id, signal.SIGTERM)


def signal_process(process_id, signal_code):
    os.killpg(os.getpgid(process_id), signal_code)
