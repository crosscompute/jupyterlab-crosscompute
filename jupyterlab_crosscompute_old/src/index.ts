import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
// import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITranslator } from '@jupyterlab/translation';

import { CommandIDs, COMMAND_CATEGORY } from './constant';
import { requestAPI } from './handler';
import { AutomationBody } from './body';
import { AutomationModel } from './model';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-crosscompute:plugin',
  autoStart: true,
  requires: [ILabShell, IDocumentManager, ITranslator],
  activate: (
    app: JupyterFrontEnd,
    browserFactory: IFileBrowserFactory,
    labShell: ILabShell,
    docManager: IDocumentManager,
    translator: ITranslator,
    palette?: ICommandPalette,
    restorer?: ILayoutRestorer
  ) => {
    const browserModel = browserFactory.defaultBrowser.model;
    const automationBody = new AutomationBody(
      automationModel,
      browserModel,
      docManager,
      commands
    );

    labShell.layoutModified.connect(() => automationBody.onUpdate());
    browserModel.pathChanged.connect(() => automationBody.onUpdate(true));

    commands.addCommand(CommandIDs.launchStart, {
      label: trans.__('Start Launch Automation'),
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
      label: trans.__('Stop Launch Automation'),
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
    });
