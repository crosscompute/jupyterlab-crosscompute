from os.path import dirname


def get_automation_dictionary(automation, state_by_folder):
    configuration_path = automation.path
    configuration = automation.configuration
    automation_folder = dirname(configuration_path)
    state = state_by_folder.get(automation_folder, {})
    automation_dictionary = {
        'path': configuration_path,
        'folder': automation_folder,
        'uri': state.get('uri', ''),
        'name': configuration.get('name', ''),
        'version': configuration.get('version', ''),
    }
    if 'batches' in configuration:
        batch_definitions = []
        for batch_dictionary in configuration['batches']:
            batch_definition = {
                'name': batch_dictionary.get('name', ''),
                'folder': batch_dictionary['folder'],
            }
            batch_configuration = batch_dictionary.get('configuration', {})
            if 'path' in batch_configuration:
                batch_definition['configuration'] = {
                    'path': batch_configuration['path']}
            batch_definitions.append(batch_definition)
        automation_dictionary['batches'] = batch_definitions
    return automation_dictionary
