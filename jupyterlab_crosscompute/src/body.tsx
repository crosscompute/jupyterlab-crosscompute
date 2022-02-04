import { CommandRegistry } from '@lumino/commands';
import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import React from 'react';

import { ErrorCode, logoIcon, START_LAUNCH_COMMAND } from './constant';
import { requestAPI } from './handler';
import { AutomationConfiguration, AutomationModel } from './model';

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
        this._model.configuration = new AutomationConfiguration(
          d.path,
          d.folder,
          d.uri,
          d.name,
          d.version,
          d.batches
        );
      })
      .catch(d => {
        this._model.error = d;
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
  const { configuration, error } = model;
  const { path, folder, uri, name, version, batches } = configuration;
  const { message, code } = error;

  let content;
  if (code === ErrorCode.CONFIGURATION_NOT_FOUND) {
    content = '';
  } else if (message) {
    content = message;
  } else {
    const batchLinks = batches.map((d, i) => (
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
          {uri}
        </div>
        <div className="crosscompute-AutomationInformationBody">
          <div>
            <a className="crosscompute-Link" onClick={() => openPath(path)}>
              Automation Configuration
            </a>
          </div>
          {batchLinks.length > 0 && (
            <div className="crosscompute-BatchDefinitions">
              Batch Definitions
              <ul>{batchLinks}</ul>
            </div>
          )}
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
    );
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
