import { FileBrowser } from '@jupyterlab/filebrowser';
import { PanelLayout, Widget } from '@lumino/widgets';

export class CrossComputeBrowser extends Widget {
  constructor(browser: FileBrowser) {
    super();
    this.layout = new PanelLayout();
    (this.layout as PanelLayout).addWidget(browser);
  }
}
