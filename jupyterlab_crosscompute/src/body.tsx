import { CommandRegistry } from '@lumino/commands';
import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import React from 'react';

import { ErrorCode, logoIcon, START_LAUNCH_COMMAND } from './constant';
import { requestAPI } from './handler';
import { AutomationModel } from './model';

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
          <AutomationComponent
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

const AutomationComponent = ({
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
  if (error.code) {
    const { message, code } = error;
    switch (code) {
      case ErrorCode.CONFIGURATION_NOT_FOUND:
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
              Batch Definitions
              <ul>{batchLinks}</ul>
            </div>
          )}
          <div className="crosscompute-LaunchControl">
            {launch.uri}
            <button
              onClick={() =>
                commands.execute(START_LAUNCH_COMMAND).catch(reason => {
                  console.error(`could not launch automation: ${reason}`);
                })
              }
            >
              Launch
            </button>
          </div>
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
