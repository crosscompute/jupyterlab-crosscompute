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
    print(automation.folder, automation_folder, automation_dictionary['folder'])
    if 'uri' in state:
        automation_dictionary.update({
            'uri': state['uri'],
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
