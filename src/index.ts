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
    registerFocusPathLogger(labShell, docManager, browser);

    shell.add(automationBody, 'right', { rank: 1000 });

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

interface IFileBrowserLike {
  model: {
    path: string;
  };
  node: HTMLElement;
}

const normalizePath = (path: string): string => {
  return path ? `/${path.replace(/^\/+/, '')}` : '/';
};

const getWidgetPath = (
  docManager: IDocumentManager,
  widget: ILabShell['currentWidget']
): string | null => {
  if (!widget) {
    return null;
  }
  const path = docManager.contextForWidget(widget)?.path;
  return path ? normalizePath(path) : null;
};

const isNode = (target: EventTarget | null): target is Node => {
  return target instanceof Node;
};

const registerFocusPathLogger = (
  labShell: ILabShell,
  docManager: IDocumentManager,
  browser: IFileBrowserLike
): void => {
  let lastLoggedPath = '';
  let lastLoggedAt = 0;

  const logPath = (path: string | null): void => {
    if (!path) {
      return;
    }
    const now = Date.now();
    if (path === lastLoggedPath && now - lastLoggedAt < 50) {
      return;
    }
    lastLoggedPath = path;
    lastLoggedAt = now;
    console.log(path);
  };

  const logBrowserFolder = (): void => {
    logPath(normalizePath(browser.model.path));
  };

  const logCurrentDocument = (): void => {
    logPath(getWidgetPath(docManager, labShell.currentWidget));
  };

  const scheduleCurrentDocumentLog = (): void => {
    window.requestAnimationFrame(logCurrentDocument);
  };

  const handleFocusOrClick = (event: Event): void => {
    if (!isNode(event.target)) {
      return;
    }
    if (browser.node.contains(event.target)) {
      logBrowserFolder();
      return;
    }
    if (!labShell.currentWidget?.node.contains(event.target)) {
      return;
    }
    scheduleCurrentDocumentLog();
  };

  labShell.currentPathChanged.connect((_, args) => {
    logPath(normalizePath(args.newValue));
  });
  document.addEventListener('focusin', handleFocusOrClick, true);
  document.addEventListener('click', handleFocusOrClick, true);
};

export default plugin;
