import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { Widget } from '@lumino/widgets';

import { requestAPI } from './handler';

import { logoIcon } from './constant';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { IDocumentManager } from '@jupyterlab/docmanager';


/**
 * Initialization data for the jupyterlab-crosscompute extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-crosscompute:plugin',
  description: 'CrossCompute Extensions for JupyterLab',
  autoStart: true,
  requires: [IFileBrowserFactory, IDocumentManager],
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    browserFactory: IFileBrowserFactory,
    docManager: IDocumentManager,
    settingRegistry: ISettingRegistry | null
  ) => {
    const { shell } = app;
    const exampleWidget: ExampleWidget = new ExampleWidget();

    const browser = browserFactory.createFileBrowser('my-browser');
    const browserModel = browser.model;

    // Run when user open a file
    const refresh = () => {
        console.log('/' + browserModel.path)
        const items = browserModel.items();

        console.log('Show all items in cur dir');
        for (const item of items) {
        console.log(item.name);
        }
    }

    browserModel.pathChanged.connect(refresh);
    shell.currentChanged?.connect(refresh);
      
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

    const title = this.title;
    title.icon = logoIcon;
  }
}

export default plugin;
