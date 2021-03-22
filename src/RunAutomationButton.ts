import { JupyterFrontEnd } from '@jupyterlab/application';
import { ToolbarButton } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import {
  RUN_AUTOMATION_BUTTON_TIMEOUT_IN_MILLISECONDS,
  RUN_AUTOMATION_COMMAND,
  TOOLBAR_BUTTON_INDEX
} from './constants';

class RunAutomationButton
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  constructor(app: JupyterFrontEnd) {
    this._app = app;
  }

  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const button = new ToolbarButton({
      iconClass: 'crosscompute-icon',
      tooltip: 'Run Automation',
      onClick: (): void => {
        const buttonElement = button.node.children[0];
        buttonElement.setAttribute('disabled', '');

        setTimeout(() => {
          buttonElement.removeAttribute('disabled');
        }, RUN_AUTOMATION_BUTTON_TIMEOUT_IN_MILLISECONDS);

        this._app.commands.execute(RUN_AUTOMATION_COMMAND);
      }
    });
    panel.toolbar.insertItem(TOOLBAR_BUTTON_INDEX, 'Run Automation', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }

  private _app: JupyterFrontEnd;
}

export default RunAutomationButton;
