import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

/**
 * Initialization data for the crosscompute-jupyterlab-extensions extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'crosscompute-jupyterlab-extensions:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension crosscompute-jupyterlab-extensions is activated!');

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The crosscompute_jupyterlab_extensions server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default extension;
