import { ReactWidget, UseSignal } from '@jupyterlab/apputils';

import React from 'react';

import { ErrorCode, logoIcon } from './constant';
import { requestAPI } from './handler';
import { AutomationModel } from './model';

export class AutomationBody extends ReactWidget {
  constructor(
    openFolder: (folder: string) => void,
    openPath: (folder: string) => void
  ) {
    super();
    this._openFolder = openFolder;
    this._openPath = openPath;
    this._model = new AutomationModel();

    this.id = 'crosscompute-automation';
    this.addClass('crosscompute-Automation');

    const title = this.title;
    title.icon = logoIcon;
    title.caption = 'CrossCompute Automation';
  }

  updateModel(model: { folder: string }): void {
    const { folder } = model;

    let shouldUpdate = false;
    if (this._model.folder !== folder) {
      shouldUpdate = true;
    }
    if (this.isHidden || !shouldUpdate) {
      return;
    }

    this._model.folder = folder;
    requestAPI<any>('launch?folder=' + folder)
      .then(d => {
        delete this._model.error;
        this._model.launch = d;
        this._model.changed.emit();
        console.debug('AutomationBody.updateModel OK');
      })
      .catch(d => {
        this._model.error = d;
        this._model.changed.emit();
        console.debug('AutomationBody.updateModel ERROR');
      });
    console.debug('AutomationBody.updateModel UPDATE');
  }

  render(): JSX.Element {
    console.debug('AutomationBody.render');
    return (
      <UseSignal signal={this._model.changed} initialSender={this._model}>
        {() => (
          <AutomationControl
            model={this._model}
            openFolder={this._openFolder}
            openPath={this._openPath}
          />
        )}
      </UseSignal>
    );
  }

  private _model: AutomationModel;
  private _openFolder: (folder: string) => void;
  private _openPath: (folder: string) => void;
}

const AutomationControl = ({
  model,
  openFolder,
  openPath
}: {
  model: AutomationModel;
  openFolder: (folder: string) => void;
  openPath: (path: string) => void;
}): JSX.Element => {
  console.debug('AutomationControl.render');
  const { error } = model;
  return (
    <>
      {error ? (
        <ErrorContent
          model={model}
          openFolder={openFolder}
          openPath={openPath}
        />
      ) : (
        <AutomationContent model={model} />
      )}
      <AutomationReference />
    </>
  );
};

const ErrorContent = ({
  model,
  openFolder,
  openPath
}: {
  model: AutomationModel;
  openFolder: (folder: string) => void;
  openPath: (path: string) => void;
}): JSX.Element => {
  const { error } = model;
  const message = error?.message;
  const code = error?.code;
  const path = error?.path;

  let content;
  switch (code) {
    case ErrorCode.configurationNotFound: {
      const { launch } = model;
      const { folder, name, version } = launch;
      content = folder ? (
        <a className="crosscompute-Link" onClick={() => openFolder(folder)}>
          {name ? `${name} ${version}` : 'Automation Folder'}
        </a>
      ) : (
        ''
      );
      break;
    }
    default: {
      content = path ? (
        <a className="crosscompute-Link" onClick={() => openPath(path)}>
          {message}
        </a>
      ) : (
        message
      );
    }
  }

  return <>{content}</>;
};

const AutomationContent = ({
  model
}: {
  model: AutomationModel;
}): JSX.Element => {
  return <div></div>;
};

const AutomationReference = (): JSX.Element => {
  return (
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
};
