import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
// import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { AutomationBody } from './body';

const normalizeJupyterPath = (path = ''): string =>
  '/' + path.replace(/^\/+/, '');

const targetIsInside = (
  target: EventTarget | null,
  selector: string
): boolean => {
  const element = target instanceof Element ? target : null;
  return element?.closest(selector) !== null;
};

/**
 * Initialization data for the jupyterlab-crosscompute extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-crosscompute:plugin',
  autoStart: true,
  requires: [IFileBrowserFactory, ILabShell, IDocumentManager],
  optional: [
    // ISettingRegistry
    ILayoutRestorer
  ],
  activate: (
    app: JupyterFrontEnd,
    browserFactory: IFileBrowserFactory,
    labShell: ILabShell,
    docManager: IDocumentManager,
    // settingRegistry?: ISettingRegistry,
    restorer?: ILayoutRestorer
  ) => {
    const { shell, commands } = app;
    const browser = browserFactory.defaultBrowser;
    const browserModel = browser.model;
    const openFolder = (folder: string) => {
      labShell.activateById(browser.id);
      browserModel.cd(folder);
    };
    const openPath = (path: string) => docManager.openOrReveal(path);
    const automationBody = new AutomationBody(commands, openFolder, openPath);
    const refresh = () =>
      automationBody.updateModel({ folder: '/' + browserModel.path });
    browserModel.pathChanged.connect(refresh);
    labShell.layoutModified.connect(refresh);

    shell.add(automationBody, 'right', { rank: 1000 });

    let lastLoggedPath: string | null = null;
    const logPath = (path: string) => {
      const normalizedPath = normalizeJupyterPath(path);
      if (normalizedPath === lastLoggedPath) {
        return;
      }
      lastLoggedPath = normalizedPath;
      console.log(normalizedPath);
    };
    const logActiveDocumentPath = () => {
      const currentWidget = labShell.currentWidget;
      const context = currentWidget
        ? docManager.contextForWidget(currentWidget)
        : null;
      if (context?.path) {
        logPath(context.path);
      }
    };
    const logFocusedPath = (event: Event) => {
      if (targetIsInside(event.target, '.jp-FileBrowser')) {
        logPath(browserModel.path);
        return;
      }
      window.setTimeout(logActiveDocumentPath, 0);
    };
    document.addEventListener('focusin', logFocusedPath, true);
    document.addEventListener('click', logFocusedPath, true);
    automationBody.disposed.connect(() => {
      document.removeEventListener('focusin', logFocusedPath, true);
      document.removeEventListener('click', logFocusedPath, true);
    });

    /*
    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('jupyterlab-crosscompute settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for jupyterlab-crosscompute.', reason);
        });
    }
    */

    if (restorer) {
      restorer.add(automationBody, automationBody.id);
    }
  }
};

export default plugin;
