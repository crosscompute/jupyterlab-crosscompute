import { JupyterFrontEnd } from '@jupyterlab/application';
import { ToolbarButton, Spinner } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { Widget } from '@lumino/widgets';
import { CommandIDs } from './index';

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
      onClick: (): void => {
        button.setHidden(true);
        this._app.commands
          .execute(CommandIDs.getDownloadUrl, { path: '' })
          .then(data => {
            console.log('token', this._token);
            const spinner = new Spinner();
            Widget.attach(spinner, document.body);
            return { spinner, url: data.url };
          })
          .then(
            data =>
              new Promise(resolve => {
                setTimeout(() => {
                  data.spinner.close();
                  resolve(data.url);
                }, 3000);
              })
          )
          .then(url => {
            console.log('download url', url);
            window.location.href = url as string;
            button.setHidden(false);
          })
          .catch(error => {
            console.log('error', error);
            button.setHidden(false);
          });
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

export default DownloadButton;
