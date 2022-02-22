def get_automation_dictionary(automation, state_by_folder):
    state = state_by_folder.get(automation_folder, {})
    if 'uri' in state:
        automation_dictionary.update({
            'uri': state['uri'],
        })
