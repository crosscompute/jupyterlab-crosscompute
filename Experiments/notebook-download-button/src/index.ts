import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ToolbarButton, Spinner, InputDialog } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { Widget } from '@lumino/widgets';

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
  const downloadButton = new DownloadButton(app);
  app.restored.then(() => {
    InputDialog.getText({ title: ' CrossCompute token' })
      .then((result: any) => {
        console.log(result.value);
        downloadButton.setToken = result.value;
        console.log('updated token');
      })
      .catch(() => console.log('error'));
  });
  app.docRegistry.addWidgetExtension('Notebook', downloadButton);
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
          .then(() => {
            console.log('creating spinner');
            console.log('token', this._token);
            const spinner = new Spinner();
            Widget.attach(spinner, document.body);
            return spinner;
          })
          .then(
            spinner =>
              new Promise(resolve => {
                setTimeout(() => {
                  console.log('closing spinner');
                  spinner.close();
                  resolve();
                }, 3000);
              })
          )
          .then(() => {
            console.log('download');
            const zipUrl =
              'https://storage.googleapis.com/crosscompute-20200929/example-20200929.zip';
            console.log(zipUrl);
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

  public set setToken(newToken: string) {
    this._token = newToken;
  }

  private _app: JupyterFrontEnd;
  private _token = '';
}

export default extension;
