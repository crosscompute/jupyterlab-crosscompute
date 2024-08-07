import {
  ILayoutRestorer,
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';
import { CrossComputePanel } from './body';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-crosscompute:plugin',
  description: 'CrossCompute Extensions for JupyterLab',
  autoStart: true,
  requires: [ILabShell, IDefaultFileBrowser, IDocumentManager],
  optional: [ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd,
    labShell: ILabShell,
    defaultFileBrowser: IDefaultFileBrowser,
    docManager: IDocumentManager,
    restorer?: ILayoutRestorer
  ) => {
    const { shell } = app;

    console.log('FileBrowser', defaultFileBrowser);
    const openPath = (path: string) => docManager.openOrReveal(path);
    const openFolder = (folder: string) => {                                                             
      labShell.activateById(defaultFileBrowser.id);                                      
      defaultFileBrowser.model.cd(folder);                                                                           
    }

    
    const panel: CrossComputePanel = new CrossComputePanel(openPath, openFolder);


    // Change focus when users open different files
    labShell.currentPathChanged.connect((sender, args) => {
      panel.updatePath(args['newValue']);
    });

    // Change path when users go up/down in left filebrowser
    if (defaultFileBrowser) {
      defaultFileBrowser.model.pathChanged.connect((sender, args) => {
        panel.updatePath(defaultFileBrowser.model.path);
      });
    }

    var source = new EventSource('/jupyterlab-crosscompute/log-stream');
      source.onmessage = function(message) {
        panel.updateLog(message.data);
      };

    shell.add(panel, 'right', { rank: 700 });

    if (restorer) {
      restorer.add(panel, panel.id);
    }

  }
};

export default plugin;
