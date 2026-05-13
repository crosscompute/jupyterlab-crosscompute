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

const DOCUMENT_AREA_SELECTOR =
  '#jp-main-dock-panel, .jp-MainAreaWidget, .jp-DocumentWidget';
const LOG_DEDUPE_WINDOW_MS = 100;

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

    let lastLoggedPathInBurst: string | null = null;
    let clearLastLoggedPathTimeout: number | null = null;
    const clearLastLoggedPathInBurst = () => {
      lastLoggedPathInBurst = null;
      clearLastLoggedPathTimeout = null;
    };
    const logPath = (path: string) => {
      const normalizedPath = normalizeJupyterPath(path);
      if (normalizedPath === lastLoggedPathInBurst) {
        return;
      }
      lastLoggedPathInBurst = normalizedPath;
      if (clearLastLoggedPathTimeout !== null) {
        window.clearTimeout(clearLastLoggedPathTimeout);
      }
      clearLastLoggedPathTimeout = window.setTimeout(
        clearLastLoggedPathInBurst,
        LOG_DEDUPE_WINDOW_MS
      );
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
      if (targetIsInside(event.target, DOCUMENT_AREA_SELECTOR)) {
        window.setTimeout(logActiveDocumentPath, 0);
      }
    };
    document.addEventListener('focusin', logFocusedPath, true);
    document.addEventListener('click', logFocusedPath, true);
    automationBody.disposed.connect(() => {
      document.removeEventListener('focusin', logFocusedPath, true);
      document.removeEventListener('click', logFocusedPath, true);
      if (clearLastLoggedPathTimeout !== null) {
        window.clearTimeout(clearLastLoggedPathTimeout);
      }
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
