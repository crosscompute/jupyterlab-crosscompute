import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
// import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITranslator } from '@jupyterlab/translation';

import {
  COMMAND_CATEGORY,
  // START_DEPLOY_COMMAND,
  START_LAUNCH_COMMAND,
  // START_RENDER_COMMAND,
  // STOP_DEPLOY_COMMAND,
  STOP_LAUNCH_COMMAND
  // STOP_RENDER_COMMAND,
} from './constant';
// import { requestAPI } from './handler';
import { AutomationBody } from './body';
import { AutomationModel } from './model';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-crosscompute:plugin',
  autoStart: true,
  requires: [IFileBrowserFactory, ILabShell, IDocumentManager, ITranslator],
  optional: [
    ICommandPalette,
    // ISettingRegistry,
    ILayoutRestorer
  ],
  activate: (
    app: JupyterFrontEnd,
    browserFactory: IFileBrowserFactory,
    labShell: ILabShell,
    docManager: IDocumentManager,
    translator: ITranslator,
    palette?: ICommandPalette,
    // settingRegistry?: ISettingRegistry,
    restorer?: ILayoutRestorer
  ) => {
    const { commands, shell } = app;
    const browser = browserFactory.defaultBrowser;
    const trans = translator.load('jupyterlab');
    const automationModel = new AutomationModel();
    const automationBody = new AutomationBody(
      automationModel,
      commands,
      browserFactory,
      docManager
    );
    labShell.layoutModified.connect(() => automationBody.onUpdate());
    browser.model.pathChanged.connect(() => automationBody.onUpdate(true));
    shell.add(automationBody, 'right', { rank: 1000 });

    commands.addCommand(START_LAUNCH_COMMAND, {
      label: trans.__('Start Launch Automation'),
      execute: (args: any) => {
        automationModel.updateConfiguration(uri='?');
        /*
        const formData = new FormData();
        formData.append('path', browser.model.path);
        requestAPI<any>('launch', {
          method: 'POST',
          body: formData
        })
          .then(d => {
            console.log(d);
          })
          .catch(d => {
            console.error(d);
            console.log(d.message);
          });
        */
      }
    });
    commands.addCommand(STOP_LAUNCH_COMMAND, {
      label: trans.__('Stop Launch Automation'),
      execute: (args: any) => {
        console.log(STOP_LAUNCH_COMMAND);
      }
    });
    /*
    commands.addCommand(START_RENDER_COMMAND, {
      label: trans.__('Start Render Automation'),
      execute: (args: any) => {
        console.log(START_RENDER_COMMAND);
      }
    });
    commands.addCommand(STOP_RENDER_COMMAND, {
      label: trans.__('Stop Render Automation'),
      execute: (args: any) => {
        console.log(STOP_RENDER_COMMAND);
      }
    });
    commands.addCommand(START_DEPLOY_COMMAND, {
      label: trans.__('Start Deploy Automation'),
      execute: (args: any) => {
        console.log(START_DEPLOY_COMMAND);
      }
    });
    commands.addCommand(STOP_DEPLOY_COMMAND, {
      label: trans.__('Stop Deploy Automation'),
      execute: (args: any) => {
        console.log(STOP_DEPLOY_COMMAND);
      }
    });
    */

    if (palette) {
      palette.addItem({
        command: START_LAUNCH_COMMAND,
        category: COMMAND_CATEGORY
      });
      palette.addItem({
        command: STOP_LAUNCH_COMMAND,
        category: COMMAND_CATEGORY
      });
      /*
      palette.addItem({
        command: START_RENDER_COMMAND, category: COMMAND_CATEGORY
      });
      palette.addItem({
        command: STOP_RENDER_COMMAND, category: COMMAND_CATEGORY
      });
      palette.addItem({
        command: START_DEPLOY_COMMAND, category: COMMAND_CATEGORY
      });
      palette.addItem({
        command: STOP_DEPLOY_COMMAND, category: COMMAND_CATEGORY
      });
      */
    }

    /*
    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          // console.log(settings.composite);
        })
        .catch(reason => {
          // console.error(reason);
        });
    }
    */

    if (restorer) {
      restorer.add(automationBody, automationBody.id);
    }
  }
};

export default plugin;
