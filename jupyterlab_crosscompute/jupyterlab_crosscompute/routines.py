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
    }
    print(automation_dictionary)
    return automation_dictionary
