import { JupyterFrontEnd } from '@jupyterlab/application';
import { ToolbarButton /*Spinner*/ } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
// import { Widget } from '@lumino/widgets';
import { RUN_AUTOMATION_COMMAND } from './index';

class RunAutomationButton
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
      tooltip: 'Run Automation',
      onClick: (): void => {
        console.log('----------', panel, context, this._token);
        (window as any).panel = panel;
        (window as any).context = context;
        button.node.children[0].setAttribute('disabled', '');
        setTimeout(() => {
          button.node.children[0].removeAttribute('disabled');
        }, 2000);

        this._app.commands.execute(RUN_AUTOMATION_COMMAND, {
          path: context.path,
        });
        /*
          .then(data => {
            console.log('data ------', data);
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
            // window.location.href = url as string;
            button.setHidden(false);
          })
          .catch(error => {
            console.log('error', error);
            button.setHidden(false);
          });
          */
      },
    });
    const toolbarItemLength = panel.toolbar;
    console.log('toolbarItemLength', toolbarItemLength);
    panel.toolbar.insertItem(10, 'Run Automation', button);
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

export default RunAutomationButton;
