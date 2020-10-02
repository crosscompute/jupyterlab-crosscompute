import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ToolbarButton } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { requestAPI } from './notebook-download-button';

/**
 * Initialization data for the notebook-download-button extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'notebook-download-button',
  autoStart: true,
  activate: activate
};

namespace CommandIDs {
  export const download = 'crosscompute:download';
}

function activate(app: JupyterFrontEnd): void {
  console.log('JupyterLab extension notebook-download-button is activated!');
  app.commands.addCommand(CommandIDs.download, {
    label: 'CrossCompute Download',
    execute: (args: any) => {
      console.log('crosscompute:download');
      requestAPI<any>('download')
        .then(data => {
          console.log('successfully downloaded');
        })
        .catch(reason => {
          console.error('error: not able to download');
        });
    }
  });
  app.docRegistry.addWidgetExtension('Notebook', new DownloadButton(app));
}

class DownloadButton
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  /**
   * Create a new extension object.
   */
  constructor(app: JupyterFrontEnd) {
    this._app = app;
  }
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const button = new ToolbarButton({
      iconClass: 'jp-crosscompute-icon',
      tooltip: 'CrossCompute Download',
      onClick: () => {
        this._app.commands
          .execute(CommandIDs.download, { path: '' })
          .then(
            () =>
              new Promise(resolve => {
                setTimeout(resolve, 5000);
              })
          )
          .then(() => {
            console.log('download');
            const zipUrl =
              'https://storage.googleapis.com/crosscompute-20200929/example-20200929.zip';
            window.location.href = zipUrl;
          })
          .catch(error => console.log('error', error));
      }
    });
    const toolbarItemLength = panel.toolbar;
    console.log('toolbarItemLength', toolbarItemLength);
    panel.toolbar.insertItem(10, 'CrossCompute Download', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }

  private _app: JupyterFrontEnd;
}

export default extension;
