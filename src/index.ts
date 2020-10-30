import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
// import { requestAPI } from './crosscompute-jupyterlab-extensions';
import RunAutomationButton from './RunAutomationButton';

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
      console.log(args);
      const url = '';
      const id = setInterval(async () => {
        console.log('fetching');
        const res = await fetch(url, { method: 'HEAD' });
        const status = res.status;
        console.log('status', status);
        if (status === 200) {
          clearInterval(id);
          window.location.href = url;
        }
      }, 5000);

      /*
      requestAPI<any>('get_example?path=' + args.path)
        .then(url => {
          let status;
          console.log(url);
          const id = setInterval(() => {
            fetch(url, { method: 'HEAD' }).then((response: any) => {
              clearInterval()
            });
          }, 5000);
          window.location.href = url;
        })
        .catch(reason => {
          console.error(
            `The crosscompute_jupyterlab_extensions server extension appears to be missing.\n${reason}`
          );
        });
      */
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
