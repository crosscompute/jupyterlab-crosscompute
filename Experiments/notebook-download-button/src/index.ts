import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IStateDB } from '@jupyterlab/statedb';
import { InputDialog, ICommandPalette } from '@jupyterlab/apputils';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { Menu } from '@lumino/widgets';
import { ReadonlyJSONObject } from '@lumino/coreutils';
import { requestAPI } from './notebook-download-button';
import DownloadButton from './DownloadButton';

/**
 * Initialization data for the notebook-download-button extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'notebook-download-button',
  autoStart: true,
  requires: [ICommandPalette, IMainMenu, IStateDB],
  activate: activate
};

export const CommandIDs = {
  getDownloadUrl: 'crosscompute:getDownloadUrl',
  resetToken: 'crosscompute:resetToken',
  downloadFile: 'crosscompute:downloadFile'
};

function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  mainMenu: IMainMenu,
  state: IStateDB
): void {
  console.log('JupyterLab extension notebook-download-button is activated!');
  const plugInId = 'CrossCompute';
  app.commands.addCommand(CommandIDs.getDownloadUrl, {
    label: 'CrossCompute Download Url',
    execute: (args: any) => {
      return requestAPI<any>('download');
    }
  });

  app.commands.addCommand(CommandIDs.resetToken, {
    label: 'Reset Token',
    execute: (args: any) => {
      InputDialog.getText({ title: ' CrossCompute Token' })
        .then((result: any) => {
          if (!result.value) {
            return;
          }
          downloadButton.setToken = result.value;
          state.save(plugInId, { token: result.value });
          console.log('updated token', result.value);
        })
        .catch(() => console.log('error'));
    }
  });

  const downloadButton = new DownloadButton(app);
  app.restored
    .then(() => state.fetch(plugInId))
    .then(state => {
      console.log(state);
      if (state) {
        const stateJson = state as ReadonlyJSONObject;
        console.log('state', stateJson);
        if (stateJson) {
          downloadButton.setToken = stateJson.token as string;
          return;
        }
        app.commands.execute(CommandIDs.resetToken);
      }
    });
  app.docRegistry.addWidgetExtension('Notebook', downloadButton);

  const CrossComputeMenu: Menu = new Menu({ commands: app.commands });
  CrossComputeMenu.title.label = 'CrossCompute';
  mainMenu.addMenu(CrossComputeMenu, { rank: 80 });

  CrossComputeMenu.addItem({ command: CommandIDs.resetToken });
}

export default extension;
