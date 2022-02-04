import { CommandRegistry } from '@lumino/commands';
import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import React from 'react';

import { CommandIDs, ErrorCode, logoIcon } from './constant';
import { requestAPI } from './handler';
import { AutomationModel, ILaunchState } from './model';

export class AutomationBody extends ReactWidget {
  constructor(
    model: AutomationModel,
    commands: CommandRegistry,
    browserFactory: IFileBrowserFactory,
    docManager: IDocumentManager
  ) {
    super();
    this._model = model;
    this._browserFactory = browserFactory;
    this._docManager = docManager;
    this._commands = commands;

    this.id = 'crosscompute-automation';
    this.addClass('crosscompute-Automation');

    const title = this.title;
    title.icon = logoIcon;
    title.caption = 'CrossCompute Automation';
  }

  render(): JSX.Element {
    const openPath = (path: string) => this._docManager.openOrReveal(path);
    const openFolder = (folder: string) =>
      this._browserFactory.defaultBrowser.model.cd(folder);
    return (
      <UseSignal signal={this._model.changed} initialSender={this._model}>
        {() => (
          <AutomationControl
            model={this._model}
            commands={this._commands}
            openPath={openPath}
            openFolder={openFolder}
          />
        )}
      </UseSignal>
    );
  }

  onUpdate(isDirty?: boolean): void {
    if (isDirty) {
      this._isDirty = true;
    }
    if (this.isHidden || !this._isDirty) {
      return;
    }
    const { path } = this._browserFactory.defaultBrowser.model;
    requestAPI<any>('launch?folder=' + path)
      .then(d => {
        this._model.launch = d;
        this._model.error = {};
        this._model.changed.emit();
      })
      .catch(d => {
        this._model.error = d;
        this._model.changed.emit();
      });
    this._isDirty = false;
  }

  private _model: AutomationModel;
  private _browserFactory: IFileBrowserFactory;
  private _docManager: IDocumentManager;
  private _commands: CommandRegistry;
  private _isDirty = true;
}

const AutomationControl = ({
  model,
  commands,
  openPath,
  openFolder
}: {
  model: AutomationModel;
  openPath: (path: string) => void;
  openFolder: (folder: string) => void;
  commands: CommandRegistry;
}): JSX.Element => {
  const { launch, error } = model;

  let content;
  if (error.message) {
    const { message, code } = error;
    switch (code) {
      case ErrorCode.configurationNotFound:
        content = '';
        break;
      default:
        content = message;
    }
  } else if (launch.path) {
    const { path, folder, name, version, batches } = launch;
    const batchLinks = batches?.map((d, i) => (
      <li key={i}>
        <a
          className="crosscompute-Link"
          onClick={() => {
            if (d.configuration) {
              openPath(folder + '/' + d.configuration.path);
            } else {
              openFolder(d.folder);
            }
          }}
        >
          {d.name || d.folder}
        </a>
      </li>
    ));
    content = (
      <div className="crosscompute-AutomationInformation">
        <div className="crosscompute-AutomationInformationHeader">
          <div className="crosscompute-AutomationName">{name}</div>
          <div className="crosscompute-AutomationVersion">{version}</div>
        </div>
        <div className="crosscompute-AutomationInformationBody">
          <div>
            <a className="crosscompute-Link" onClick={() => openPath(path)}>
              Automation Configuration
            </a>
          </div>
          {batchLinks && (
            <div className="crosscompute-BatchDefinitions">
              <div className="crosscompute-BatchDefinitionsHeader">
                Batch Definitions
              </div>
              <ul>{batchLinks}</ul>
            </div>
          )}
          <LaunchControl state={launch} commands={commands} />
        </div>
      </div>
    );
  } else {
    content = '';
  }

  const reference = (
    <div className="crosscompute-AutomationReference">
      <a
        className="crosscompute-Link"
        href="https://d.crosscompute.com"
        target="_blank"
      >
        CrossCompute Documentation
      </a>
    </div>
  );
  return (
    <>
      {content}
      {reference}
    </>
  );
};

const LaunchControl = ({
  state,
  commands
}: {
  state: ILaunchState | Record<string, never>;
  commands: CommandRegistry;
}): JSX.Element => {
  const { uri } = state;
  const link = uri.startsWith('http') ? (
    <a className="crosscompute-Link" href={uri} target="_blank">
      {uri}
    </a>
  ) : (
    uri
  );
  const onClickStart = () => {
    commands.execute(CommandIDs.launchStart).catch(reason => {
      console.error(`could not start launch: ${reason}`);
    });
  };
  const onClickStop = () => {
    commands.execute(CommandIDs.launchStop).catch(reason => {
      console.error(`could not stop launch: ${reason}`);
    });
  };
  const button = uri ? (
    <button onClick={onClickStop}>Stop</button>
  ) : (
    <button onClick={onClickStart}>Launch</button>
  );
  return (
    <div className="crosscompute-LaunchControl">
      {link}
      {button}
    </div>
  );
};
