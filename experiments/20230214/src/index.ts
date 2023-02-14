import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
// import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { AutomationBody } from './body';

/**
 * Initialization data for the jupyterlab-crosscompute extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-crosscompute:plugin',
  autoStart: true,
  requires: [IFileBrowserFactory, ILabShell, IDocumentManager],
  optional: [
    // ISettingRegistry
    ILayoutRestorer
  ],
  activate: (
    app: JupyterFrontEnd,
    browserFactory: IFileBrowserFactory,
    labShell: ILabShell,
    docManager: IDocumentManager,
    // settingRegistry?: ISettingRegistry,
    restorer?: ILayoutRestorer
  ) => {
    const { shell, commands } = app;
    const browser = browserFactory.defaultBrowser;
    const browserModel = browser.model;
    const openFolder = (folder: string) => {
      labShell.activateById(browser.id);
      browserModel.cd(folder);
    }
    const openPath = (path: string) => docManager.openOrReveal(path);
    const automationBody = new AutomationBody(commands, openFolder, openPath);
    const refresh = () =>
      automationBody.updateModel({ folder: '/' + browserModel.path });
    browserModel.pathChanged.connect(refresh);
    labShell.layoutModified.connect(refresh);

    shell.add(automationBody, 'right', { rank: 1000 });

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
    */

    if (restorer) {
      restorer.add(automationBody, automationBody.id);
    }
  }
};

export default plugin;
