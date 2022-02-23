from os.path import getmtime, relpath


def get_automation_dictionary(automation, state_by_folder):
    configuration = automation.configuration
    relative_path = relpath(automation.path)
    relative_folder = relpath(automation.folder)
    automation_dictionary = {
        'path': '/' + relative_path,
        'folder': '/' + relative_folder,
        'name': configuration.get('name', ''),
        'version': configuration.get('version', ''),
        'batches': get_batch_definitions(configuration),
    }
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
