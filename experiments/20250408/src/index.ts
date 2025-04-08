import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { Widget } from '@lumino/widgets';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { requestAPI } from './handler';

import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';

/**
 * Initialization data for the jupyterlab-crosscompute extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-crosscompute:plugin',
  description: 'CrossCompute Extensions for JupyterLab',
  autoStart: true,
  optional: [ISettingRegistry],
  requires: [IDefaultFileBrowser],
  activate: (
    app: JupyterFrontEnd,
    settingRegistry: ISettingRegistry | null,
    fileBrowser: IDefaultFileBrowser
  ) => {
    const sidebarPanel = new Widget();
    sidebarPanel.id = 'crosscompute-sidebar';
    app.shell.add(sidebarPanel, 'right', { rank: 727 });
    // fileBrowser.model.pathChanged.connect((sender, args) => {
    //   console.log('path changed');
    // });
    console.log(fileBrowser);
    console.log('JupyterLab extension jupyterlab-crosscompute is activated!');
    x = fileBrowser;

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log(
            'jupyterlab-crosscompute settings loaded:',
            settings.composite
          );
        })
        .catch(reason => {
          console.error(
            'Failed to load settings for jupyterlab-crosscompute.',
            reason
          );
        });
    }

    requestAPI<any>('get-example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The jupyterlab_crosscompute server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
