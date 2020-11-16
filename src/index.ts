import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { requestAPI } from './crosscompute-jupyterlab-extensions';
import RunAutomationButton from './RunAutomationButton';
import { ErrorDialogWidget, ProgressDialogWidget } from './DialogWidget';
import {
  COMMAND_PALETTE_CATEGORY,
  RUN_AUTOMATION_COMMAND,
  RUN_AUTOMATION_POLLING_INTERVAL_IN_MILLISECONDS,
} from './constants';

const extension: JupyterFrontEndPlugin<void> = {
  id: 'crosscompute-jupyterlab-extensions',
  autoStart: true,
  requires: [INotebookTracker, ICommandPalette],
  activate,
};

function activate(
  app: JupyterFrontEnd,
  tracker: INotebookTracker,
  palette: ICommandPalette
): void {
  app.commands.addCommand(RUN_AUTOMATION_COMMAND, {
    label: 'Run Automation',
    execute: async () => {
      const { context } = tracker.currentWidget;

      // Save notebook
      if (context.model.dirty && !context.model.readOnly) {
        await context.save();
      }

      let pollingIntervalId: number;
      const progressWidget = ProgressDialogWidget();
      const formData = new FormData();
      formData.append('path', context.path);
      requestAPI<any>('prints', {
        method: 'POST',
        body: formData,
      })
        .then(d => {
          const { url } = d;
          pollingIntervalId = setInterval(async () => {
            const response = await fetch(url, { method: 'HEAD' });
            const status = response.status;
            if (status === 200) {
              clearInterval(pollingIntervalId);
              window.location.href = url;
            }
          }, RUN_AUTOMATION_POLLING_INTERVAL_IN_MILLISECONDS);
          progressWidget.dispose();
        })
        .catch(reason => {
          clearInterval(pollingIntervalId);
          progressWidget.dispose();
          ErrorDialogWidget(reason.toString());
        });
    },
  });
  // Add commands to command palette
  const category = COMMAND_PALETTE_CATEGORY;
  palette.addItem({ command: RUN_AUTOMATION_COMMAND, category });
  // Add widgets
  const runAutomationButton = new RunAutomationButton(app);
  app.docRegistry.addWidgetExtension('Notebook', runAutomationButton);
}

export default extension;
