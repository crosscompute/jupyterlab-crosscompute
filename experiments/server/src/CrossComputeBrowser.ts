import { FileBrowser } from '@jupyterlab/filebrowser';
import { PanelLayout, Widget } from '@lumino/widgets';
import { ToolbarButton } from '@jupyterlab/apputils';
import { find } from '@lumino/algorithm';
import { EventSourcePolyfill } from 'event-source-polyfill';

export class CrossComputeBrowser extends Widget {
  constructor(browser: FileBrowser) {
    super();
    this.addClass('jp-crosscompute-browser');
    this.layout = new PanelLayout();
    this._browser = browser;
    // console.log(EventSourcePolyfill)
    this._token = 'FRIS2C1eCwSUztEkuN0HiCGLfjO0AzJG';
    this._echoesServer = new EventSourcePolyfill(
      'https://services.crosscompute.org' + '/echoes.json',
      {
        headers: { Authorization: 'Bearer ' + this._token }
      }
    );

    this._echoesServer.addEventListener('o', (event: any) => {
      console.log('echoesServer', event);
    });

    (this.layout as PanelLayout).addWidget(this._browser);

    console.log('browser', this._browser);
    this._runButton = new ToolbarButton({
      onClick: (): void => {
        // const url = 'https://services.crosscompute.org/prints.json';
        const buttonYml = find(this._browser.model.items(), i => {
          return i.name === 'button.yml';
        });
        console.log('buttonYml', buttonYml);
        // console.log('url', url);
        /*
        fetch(url, {
          method: 'POST'
        })
          .then(data => data.json())
          .then(data => console.log(data))
          .catch(error => console.log('error', error));
          */
      },
      iconClass: 'jp-run-icon jp-Icon jp-Icon-16',
      tooltip: 'Run Tool'
    });

    this._runButton.addClass('jp-crosscompute-toolbar-item');
    this._browser.toolbar.addItem('run', this._runButton);
  }

  private _browser: FileBrowser;
  private _runButton: ToolbarButton;
  private _echoesServer: any;
  private _token: string;
}
