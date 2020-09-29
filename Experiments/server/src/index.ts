import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { CrossComputeBrowser } from './CrossComputeBrowser';

// import { requestAPI } from './server';

/**
 * Initialization data for the server extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'server',
  autoStart: true,
  requires: [IFileBrowserFactory],
  activate: activateCrossCompute
  /*
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension server is activated!');

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The server server extension appears to be missing.\n${reason}`
        );
      });

    console.log('fetching data');
    requestAPI<any>('data')
      .then(data => console.log(data))
      .catch(reason => {
        console.error(`Error ${reason}`);
      });
  }
  */
};

function activateCrossCompute(
  app: JupyterFrontEnd,
  factory: IFileBrowserFactory
) {
  const browser = factory.createFileBrowser('crosscompute-browser', {
    refreshInterval: 300000
  });
  console.log('browser', browser);
  const crossComputeBrowser = new CrossComputeBrowser(browser);
  crossComputeBrowser.title.caption = 'Browser CrossCompute Results';
  crossComputeBrowser.title.iconClass =
    'jp-CrossCompute-icon jp-SideBar-tabIcon';
  crossComputeBrowser.id = 'crosscompute-file-browser';
  app.shell.add(crossComputeBrowser, 'left', { rank: 102 });
  return;
}

export default extension;
