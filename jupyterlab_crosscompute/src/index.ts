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

import { CommandIDs, IIntervalIds, COMMAND_CATEGORY } from './constant';
import { requestAPI } from './handler';
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
    const browserModel = browserFactory.defaultBrowser.model;
    const trans = translator.load('jupyterlab');
    const automationModel = new AutomationModel();
    const automationBody = new AutomationBody(
      automationModel,
      browserModel,
      docManager,
      commands
    );
    const intervalIdByTaskByFolder: Record<string, IIntervalIds> = {};

    labShell.layoutModified.connect(() => automationBody.onUpdate());
    browserModel.pathChanged.connect(() => automationBody.onUpdate(true));
    shell.add(automationBody, 'right', { rank: 1000 });

    commands.addCommand(CommandIDs.launchStart, {
      label: trans.__('Start Launch Automation'),
      execute: (args: any) => {
        const folder = browserModel.path;
        const formData = new FormData();
        formData.append('folder', folder);
        requestAPI<any>('launch', { method: 'POST', body: formData })
          .then(d => {
            const { uri } = d;
            automationModel.launch.uri = uri;
            const launchIntervalId = setInterval(() => {
              fetch(uri, { method: 'HEAD' }).then(() => {
                automationModel.launch.isReady = true;
                automationModel.error = {};
                automationModel.changed.emit();
                clearInterval(launchIntervalId);
              });
            }, 1000);
            const logIntervalId = setInterval(() => {
              requestAPI<any>('log?folder=' + folder).then(d => {
                automationModel.launch.log = { text: d.text };
                automationModel.changed.emit();
              });
            }, 3000);
            intervalIdByTaskByFolder[folder] = {
              launch: launchIntervalId,
              log: logIntervalId
            };
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
      label: trans.__('Stop Launch Automation'),
      execute: (args: any) => {
        const folder = browserModel.path;
        const intervalIdByTask = intervalIdByTaskByFolder[folder];
        clearInterval(intervalIdByTask.launch);
        clearInterval(intervalIdByTask.log);
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
        delete automationModel.launch.isReady;
        delete automationModel.launch.log;
        automationModel.changed.emit();
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
        command: CommandIDs.launchStart,
        category: COMMAND_CATEGORY
      });
      palette.addItem({
        command: CommandIDs.launchStop,
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
          console.log('SETTINGS', settings.composite);
        })
        .catch(reason => {
          console.error(reason);
        });
    }
    */

    if (restorer) {
      restorer.add(automationBody, automationBody.id);
    }
  }
};

export default plugin;
