import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { requestAPI } from './handler';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { IDocumentManager } from '@jupyterlab/docmanager';

import { ExampleWidget } from './body';

/**
 * Initialization data for the jupyterlab-crosscompute extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-crosscompute:plugin',
  description: 'CrossCompute Extensions for JupyterLab',
  autoStart: true,
  requires: [IFileBrowserFactory, IDocumentManager, ILabShell],
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    browserFactory: IFileBrowserFactory,
    docManager: IDocumentManager,
    labShell: ILabShell,
    settingRegistry: ISettingRegistry | null
  ) => {
    const { shell } = app;

    const browser = browserFactory.createFileBrowser('my-browser');
    const browserModel = browser.model;

    const openFolder = (folder: string) => {
      labShell.activateById(browser.id);
      browserModel.cd(folder);
    };

    const openPath = (path: string) => docManager.openOrReveal(path);


    // console.log(browserFactory.tracker.currentWidget?.model.path)
    
    const exampleWidget: ExampleWidget = new ExampleWidget(
      openFolder,
      openPath
    );

    /*
    // Run when user opens a file
    const refresh = () => {
      // exampleWidget.updateModel({ folder: '/' + browserModel.path });
      // exampleWidget.goToDir('/src')
      console.log('/' + browserModel.path);

      // const items = browserModel.items;

      console.log('All items in cur dir');
      // for (const item in items) console.log(item);
    };
    */

    const f = () => {
      console.log('pathChanged');
    };
    const g = () => {
      console.log('layoutModified');
      console.log(browserFactory.tracker.currentWidget?.model.path)

    };

    // browserModel.pathChanged.connect(refresh);
    // labShell.layoutModified.connect(refresh);
    browserModel.pathChanged.connect(f);
    labShell.layoutModified.connect(g);

    shell.add(exampleWidget, 'right', { rank: 1000 });

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings', reason);
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
