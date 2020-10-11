import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';

const extension: JupyterFrontEndPlugin<void> = {
  id: 'crosscompute-jupyterlab-extensions',
  autoStart: true,
  requires: [ICommandPalette],
  activate,
};

export const RUN_AUTOMATION_COMMAND = 'CrossCompute:RunAutomation';

function activate(app: JupyterFrontEnd, palette: ICommandPalette): void {
  app.commands.addCommand(RUN_AUTOMATION_COMMAND, {
    label: 'Run Automation',
    execute: (args: any) => {
      console.log('args', args);
    },
  });

  const category = 'CrossCompute';
  palette.addItem({
    command: RUN_AUTOMATION_COMMAND,
    category,
  });
}

export default extension;

/*
import { requestAPI } from './crosscompute-jupyterlab-extensions';

requestAPI<any>('get_example')
    .then(data => {
        console.log(data);
    })
    .catch(reason => {
  console.error(
        `The crosscompute_jupyterlab_extensions server extension appears to be missing.\n${reason}`
    );
    });
*/
