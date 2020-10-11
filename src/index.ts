import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

// import { requestAPI } from './crosscompute-jupyterlab-extensions';

const extension: JupyterFrontEndPlugin<void> = {
  id: 'crosscompute-jupyterlab-extensions',
  autoStart: true,
  activate,
};

function activate(
  app: JupyterFrontEnd,
): void {
}

export default extension;

/*
requestAPI<any>('get_example')
    .then(data => {
        console.log(data);
    })
    .catch(reason => {
  console.error(
        `The crosscompute_jupyterlab_extensions server extension appears to be missing.\n${reason}`
    );
    });
*/
