from os.path import relpath


def get_automation_dictionary(automation, state_by_folder):
    configuration = automation.configuration
    automation_path = relpath(automation.path)
    automation_folder = relpath(automation.folder)
    automation_dictionary = {
        'path': '/' + automation_path,
        'folder': '/' + automation_folder,
        'name': configuration.get('name', ''),
        'version': configuration.get('version', ''),
        'batches': get_batch_definitions(configuration),
    }
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
