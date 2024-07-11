import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { Widget } from '@lumino/widgets';

import { requestAPI } from './handler';

/**
 * Initialization data for the jupyterlab-crosscompute extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-crosscompute:plugin',
  description: 'CrossCompute Extensions for JupyterLab',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    settingRegistry: ISettingRegistry | null
  ) => {
    const { shell } = app;
    const exampleWidget: ExampleWidget = new ExampleWidget();
    shell.add(exampleWidget, 'right', { rank: 1000 });

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed load settings', reason);
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

class ExampleWidget extends Widget {
  constructor() {
    super();
    this.id = 'uhoh';
    const x = document.createElement('div');
    x.innerText = 'hey';
    this.node.appendChild(x);
  }
}

export default plugin;
