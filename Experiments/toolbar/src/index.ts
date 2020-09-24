import {
  IDisposable, DisposableDelegate
} from '@lumino/disposable';

import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils'; 
import {
  ToolbarButton
} from '@jupyterlab/apputils';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  NotebookActions, NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';


/**
 * The plugin registration information.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  activate,
  id: 'my-extension-name:buttonPlugin',
  autoStart: true,
  requires: [ICommandPalette]
};


/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export
class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  /**
   * Create a new extension object.
   */
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let callback = () => {
      NotebookActions.runAll(panel.content, context.sessionContext);
      console.log('aaaaaaaaa', panel, context)
    };
    let button = new ToolbarButton({
      className: 'myButton',
      iconClass: 'fa fa-fast-forward',
      onClick: callback,
      tooltip: 'Run All'
    });

    panel.toolbar.insertItem(0, 'runAll', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}

/**
 * Activate the extension.
 */
function activate(app: JupyterFrontEnd, palette: ICommandPalette): void {
  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
  app.commands.addCommand('console', {
    label: 'Console.log.test',
    execute: () => {
      console.log('test');
    }
  });

  palette.addItem({
    command: 'console',
    category: 'CrossCompute'
  });
};


/**
 * Export the plugin as default.
 */
export default plugin;
