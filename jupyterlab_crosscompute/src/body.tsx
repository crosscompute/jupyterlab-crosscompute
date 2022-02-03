import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import React from 'react';

import { ErrorCode, logoIcon } from './constant';
import { requestAPI } from './handler';
import { AutomationConfiguration, AutomationModel } from './model';

export class AutomationBody extends ReactWidget {
  constructor(
    model: AutomationModel,
    browserFactory: IFileBrowserFactory,
    docManager: IDocumentManager
  ) {
    super();
    this._model = model;
    this._browserFactory = browserFactory;
    this._docManager = docManager;

    this.id = 'crosscompute-automation';
    this.addClass('crosscompute-Automation');

    const title = this.title;
    title.icon = logoIcon;
    title.caption = 'CrossCompute Automation';
  }

  render(): JSX.Element {
    return (
      <UseSignal signal={this._model.changed} initialSender={this._model}>
        {() => (
          <AutomationComponent
            model={this._model}
            docManager={this._docManager}
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
  private _isDirty = true;
}

const AutomationComponent = ({
  model,
  docManager
}: {
  model: AutomationModel;
  docManager: IDocumentManager;
}): JSX.Element => {
  const { configuration, error } = model;
  const { path, folder, name, version, batches } = configuration;
  const { message, code } = error;

  let content;
  if (code === ErrorCode.CONFIGURATION_NOT_FOUND) {
    content = '';
  } else if (message) {
    content = message;
  } else {
    const batchLinks = batches.map((d, i) => (
      <a
        className="crosscompute-BatchesLink crosscompute-Link"
        onClick={() =>
          docManager.openOrReveal(folder + '/' + d.configuration.path)
        }
        key={i}
      >
        Batches Configuration
      </a>
    ));
    content = (
      <div className="crosscompute-AutomationInformation">
        <div className="crosscompute-AutomationInformationHeader">
          <div className="crosscompute-AutomationName">{name}</div>
          <div className="crosscompute-AutomationVersion">{version}</div>
        </div>
        <div className="crosscompute-AutomationInformationBody">
          <div>
            <a
              className="crosscompute-ConfigurationLink crosscompute-Link"
              onClick={() => docManager.openOrReveal(path)}
            >
              Automation Configuration
            </a>
          </div>
          {batchLinks.length > 0 && <div>{batchLinks}</div>}
          <button>Launch</button>
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
