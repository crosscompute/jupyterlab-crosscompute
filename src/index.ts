import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';

import { ErrorDialogWidget } from './ErrorDialogWidget';
import { LogDialogWidget } from './LogDialogWidget';
import RunAutomationButton from './RunAutomationButton';
import { COMMAND_PALETTE_CATEGORY, RUN_AUTOMATION_COMMAND } from './constants';
import { requestAPI } from './handler';

const extension: JupyterFrontEndPlugin<void> = {
  id: 'crosscompute-jupyterlab-extensions:plugin',
  autoStart: true,
  requires: [ICommandPalette, INotebookTracker],
  activate
};

function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  tracker: INotebookTracker
): void {
  app.commands.addCommand(RUN_AUTOMATION_COMMAND, {
    label: 'Run Automation',
    execute: async () => {
      const { context } = tracker.currentWidget;
      // Save notebook
      if (context.model.dirty && !context.model.readOnly) {
        await context.save();
      }
      const formData = new FormData();
      formData.append('path', context.path);
      let logId;
      try {
        const d = await requestAPI<any>('prints', {
          method: 'POST',
          body: formData
        });
        logId = d.id;
        // TODO: Consider replacing dialog with panel
        LogDialogWidget(logId);
      } catch (error) {
        ErrorDialogWidget(error);
      }
    }
  });

  // Add commands to command palette
  const category = COMMAND_PALETTE_CATEGORY;
  palette.addItem({ command: RUN_AUTOMATION_COMMAND, category });
  // Add widgets
  const runAutomationButton = new RunAutomationButton(app);
  app.docRegistry.addWidgetExtension('Notebook', runAutomationButton);
}

export default extension;
