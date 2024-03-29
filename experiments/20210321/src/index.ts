import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { requestAPI } from './crosscompute-jupyterlab-extensions';
import RunAutomationButton from './RunAutomationButton';
import { LogDialogWidget } from './DialogWidget';

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

      // let pollingIntervalId: number;
      const formData = new FormData();
      formData.append('path', context.path);
      const d = await requestAPI<any>('prints', {
        method: 'POST',
        body: formData,
      });
      LogDialogWidget(d.id);
    },
  });
  // Add widgets
  const runAutomationButton = new RunAutomationButton(app);
  app.docRegistry.addWidgetExtension('Notebook', runAutomationButton);
}

export default extension;
