import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
// import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { AutomationBody } from './body';

/**
 * Initialization data for the jupyterlab-crosscompute extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-crosscompute:plugin',
  autoStart: true,
  requires: [IFileBrowserFactory, ILabShell],
  optional: [
    // ISettingRegistry
    ILayoutRestorer
  ],
  activate: (
    app: JupyterFrontEnd,
    browserFactory: IFileBrowserFactory,
    labShell: ILabShell,
    // settingRegistry?: ISettingRegistry,
    restorer?: ILayoutRestorer
  ) => {
    const { shell } = app;
    const automationBody = new AutomationBody();
    shell.add(automationBody, 'right', { rank: 1000 });

    const browserModel = browserFactory.defaultBrowser.model;
    const refresh = () => automationBody.updateModel({ folder: browserModel.path });

    browserModel.pathChanged.connect(refresh);
    labShell.layoutModified.connect(refresh);

    /*
    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('jupyterlab-crosscompute settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for jupyterlab-crosscompute.', reason);
        });
    }

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The jupyterlab_crosscompute server extension appears to be missing.\n${reason}`
        );
      });
    */

    if (restorer) {
      restorer.add(automationBody, automationBody.id);
    }
  }
};

export default plugin;
