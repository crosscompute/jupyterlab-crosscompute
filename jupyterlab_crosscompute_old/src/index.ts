    commands.addCommand(CommandIDs.launchStart, {
      execute: (args: any) => {
        const folder = browserModel.path;
        console.log('LAUNCH', folder);
        const formData = new FormData();
        formData.append('folder', folder);
        requestAPI<any>('launch', { method: 'POST', body: formData })
          .then(d => {
            const { uri } = d;
            automationModel.launch.uri = uri;
            automationModel.changed.emit();
          })
          .catch(d => {
            automationModel.error = d;
            automationModel.changed.emit();
          });
        automationModel.launch.isReady = false;
        automationModel.changed.emit();
      }
    });
    commands.addCommand(CommandIDs.launchStop, {
      execute: (args: any) => {
        const folder = browserModel.path;
        console.log('LAUNCH', folder);
        const formData = new FormData();
        formData.append('folder', folder);
        requestAPI<any>('launch', { method: 'DELETE', body: formData })
          .then(d => {
            automationModel.error = {};
          })
          .catch(d => {
            automationModel.error = d;
            automationModel.changed.emit();
          });
        delete automationModel.launch.log;
        delete automationModel.launch.isReady;
        automationModel.changed.emit();
      }
