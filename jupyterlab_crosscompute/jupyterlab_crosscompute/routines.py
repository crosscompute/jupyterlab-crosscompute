from os.path import relpath


def get_automation_dictionary(automation, state_by_folder):
    configuration_path = relpath(automation.path)
    configuration = automation.configuration
    automation_folder = relpath(automation.folder)
    state = state_by_folder.get(automation_folder, {})
    automation_dictionary = {
        'path': '/' + configuration_path,
        'folder': '/' + automation_folder,
        'name': configuration.get('name', ''),
        'version': configuration.get('version', ''),
    }
    if 'uri' in state:
        uri = state['uri']
        try:
            with open(state['path'], 'rt') as f:
                log_text = f.read()
        except OSError:
            log_text = ''
        automation_dictionary.update({
            'uri': uri,
            # TODO: Consider isReady=False and re-check client side
            'isReady': True,
            'log': {'text': log_text},
        })
    batch_definitions = []
    for batch_dictionary in configuration.get('batches', []):
        batch_definition = {
            'name': batch_dictionary.get('name', ''),
            'folder': batch_dictionary['folder'],
        }
        batch_configuration = batch_dictionary.get('configuration', {})
        if 'path' in batch_configuration:
            batch_definition['configuration'] = {
                'path': batch_configuration['path']}
        batch_definitions.append(batch_definition)
    if batch_definitions:
        automation_dictionary['batches'] = batch_definitions
    return automation_dictionary
