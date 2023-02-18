import subprocess
from os.path import basename, getmtime, relpath

import requests

from .constants import ID_LENGTH, PROXY_URI, ROOT_URI
from .macros import get_unique_id


def get_automation_dictionary(automation, state_by_folder):
    configuration = automation.configuration
    relative_path = relpath(automation.path)
    relative_folder = relpath(automation.folder)
    automation_dictionary = {
        'path': '/' + relative_path,
        'folder': '/' + relative_folder,
        'name': configuration.get('name', ''),
        'version': configuration.get('version', ''),
        'batches': get_batch_definitions(configuration)}
    state = state_by_folder.get(relative_folder, {})
    if 'uri' in state:
        automation_dictionary.update({
            'uri': state['uri'],
            'log': get_log_dictionary(state),
            'isReady': False,
        })
    return automation_dictionary


def get_batch_definitions(configuration):
    batch_definitions = []
    for batch_dictionary in configuration.get('batches', []):
        batch_definition = {
            'folder': batch_dictionary['folder'],
            'name': batch_dictionary.get('name', ''),
        }
        batch_configuration = batch_dictionary.get('configuration', {})
        if 'path' in batch_configuration:
            batch_definition['configuration'] = {
                'path': batch_configuration['path']}
        batch_definitions.append(batch_definition)
    return batch_definitions


def get_log_dictionary(state):
    log_path = state['log_path']
    log_timestamp = getmtime(log_path)
    if state.get('log_timestamp') != log_timestamp:
        state['log_timestamp'] = log_timestamp
        with open(log_path, 'rt') as f:
            log_text = f.read()
        state['log_text'] = log_text
    else:
        log_text = state['log_text']
    return {'timestamp': log_timestamp, 'text': log_text}


def make_launch_state(
        request, host, port, automation_folder, log_folder, launch_states):
    headers = request.headers
    origin_uri = headers['Origin']
    if 'X-Forwarded-For' in headers:
        server_ids = [basename(_['root_uri']) for _ in launch_states]
        server_id = get_unique_id(ID_LENGTH, server_ids)
        root_uri = f'{ROOT_URI}/{server_id}'
        add_proxy_uri(root_uri, f'http://localhost:{port}')
        uri = f'{origin_uri}{root_uri}'
    else:
        root_uri = ''
        uri = f'http://{request.host_name}:{port}'
    log_folder.mkdir(parents=True, exist_ok=True)
    log_path = log_folder / f'{port}.log'
    with log_path.open('wt') as log_file:
        command_terms = [
            'crosscompute', '--host', host, '--port', str(port),
            '--timestamp', '%M%S',
            '--no-browser', '--root-uri', root_uri, '--origins', origin_uri]
        log_file.write(' '.join(command_terms) + '\n')
        process = subprocess.Popen(
            command_terms, cwd=automation_folder, start_new_session=True,
            stdout=log_file, stderr=subprocess.STDOUT)
    return {
        'root_uri': root_uri, 'uri': uri, 'log_path': log_path,
        'process': process}


def add_proxy_uri(external_uri, internal_uri):
    # TODO: Accept other proxies
    requests.post(PROXY_URI + external_uri, json={'target': internal_uri})


def remove_proxy_uri(external_uri):
    if not external_uri:
        return
    requests.delete(PROXY_URI + external_uri)
