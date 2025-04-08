import {
  ILabShell,
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
  requires: [ILabShell, IDefaultFileBrowser],
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    labShell: ILabShell,
    fileBrowser: IDefaultFileBrowser,
    settingRegistry: ISettingRegistry | null
  ) => {
    const sidebarPanel = new Widget();
    sidebarPanel.id = 'crosscompute-sidebar';
    app.shell.add(sidebarPanel, 'right', { rank: 727 });
    labShell.currentPathChanged.connect((_, args) => {
      console.log('shell path changed', args.newValue);
    });
    fileBrowser.model.pathChanged.connect((_, args) => {
      console.log('browser path changed', args.newValue);
    });
    // console.log('fileBrowser', fileBrowser);
    // console.log('settingRegistry', settingRegistry);
    console.log('JupyterLab extension jupyterlab-crosscompute is activated!');

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
