import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { requestAPI } from './crosscompute-jupyterlab-extensions';
import RunAutomationButton from './RunAutomationButton';
import { ErrorDialogWidget, ProgressDialogWidget } from './DialogWidget';

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
      const formData = new FormData();
      formData.append('path', args.path);
      const progressWidget = ProgressDialogWidget();
      requestAPI<any>('prints', {
        method: 'POST',
        body: formData,
      })
        .then(d => {
          const url = d.url;
          progressWidget.dispose();
          const intervalId = setInterval(async () => {
            const response = await fetch(url, { method: 'HEAD' });
            const status = response.status;
            if (status === 200) {
              clearInterval(intervalId);
              window.location.href = url;
            }
          }, 7000);
        })
        .catch(reason => {
          progressWidget.dispose();
          ErrorDialogWidget(reason.toString());
          console.error(
            `The crosscompute_jupyterlab_extensions server extension appears to be missing.\n${reason}`
          );
        });
    },
  });

  const category = 'CrossCompute';
  palette.addItem({
    command: RUN_AUTOMATION_COMMAND,
    category,
  });

  const runAutomationButton = new RunAutomationButton(app);
  app.docRegistry.addWidgetExtension('Notebook', runAutomationButton);
}

export default extension;

/*k
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
