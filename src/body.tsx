import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { CommandRegistry } from '@lumino/commands';
import React, { useEffect } from 'react';

import { ErrorCode, logoIcon } from './constant';
import { requestAPI } from './handler';
import { AutomationModel } from './model';

export class AutomationBody extends ReactWidget {
  constructor(
    commands: CommandRegistry,
    openFolder: (folder: string) => void,
    openPath: (folder: string) => void
  ) {
    super();
    this._commands = commands;
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
      })
      .catch(d => {
        this._model.error = d;
        this._model.changed.emit();
      });
  }

  render(): JSX.Element {
    return (
      <UseSignal signal={this._model.changed} initialSender={this._model}>
        {() => (
          <AutomationControl
            model={this._model}
            commands={this._commands}
            openFolder={this._openFolder}
            openPath={this._openPath}
          />
        )}
      </UseSignal>
    );
  }

  private _model: AutomationModel;
  private _commands: CommandRegistry;
  private _openFolder: (folder: string) => void;
  private _openPath: (folder: string) => void;
}

const AutomationControl = ({
  model,
  commands,
  openFolder,
  openPath
}: {
  model: AutomationModel;
  commands: CommandRegistry;
  openFolder: (folder: string) => void;
  openPath: (path: string) => void;
}): JSX.Element => {
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
        <AutomationContent
          model={model}
          commands={commands}
          openFolder={openFolder}
          openPath={openPath}
        />
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
  model,
  commands,
  openFolder,
  openPath
}: {
  model: AutomationModel;
  commands: CommandRegistry;
  openFolder: (folder: string) => void;
  openPath: (path: string) => void;
}): JSX.Element => {
  const { launch } = model;
  const { path, name, version } = launch;
  return (
    <div className="crosscompute-AutomationInformation">
      <div className="crosscompute-AutomationInformationHeader">
        <div className="crosscompute-AutomationName">{name || 'No Name'}</div>
        <div className="crosscompute-AutomationVersion">
          {version || 'No Version'}
        </div>
      </div>
      <div className="crosscompute-AutomationInformationBody">
        <a className="crosscompute-Link" onClick={() => openPath(path)}>
          Automation Configuration
        </a>
        <BatchDefinitions
          model={model}
          openFolder={openFolder}
          openPath={openPath}
        />
        <LaunchPanel model={model} commands={commands} />
      </div>
    </div>
  );
};

const BatchDefinitions = ({
  model,
  openFolder,
  openPath
}: {
  model: AutomationModel;
  openFolder: (folder: string) => void;
  openPath: (path: string) => void;
}): JSX.Element => {
  const { launch } = model;
  const { folder, batches } = launch;
  return batches.length ? (
    <div className="crosscompute-BatchDefinitions">
      <div className="crosscompute-BatchDefinitionsHeader">
        Batch Definitions
      </div>
      <ul>
        {batches.map((d, i) => (
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
        ))}
      </ul>
    </div>
  ) : (
    <></>
  );
};

const LaunchPanel = ({
  model,
  commands
}: {
  model: AutomationModel;
  commands: CommandRegistry;
}): JSX.Element => {
  const { launch } = model;
  const { folder } = launch;
  const { uri, log, isReady } = launch;
  const formData = new FormData();
  formData.append('folder', folder);

  let launchIntervalId: number, logIntervalId: number;
  const clearIntervals = () => {
    clearInterval(launchIntervalId);
    clearInterval(logIntervalId);
  };

  const onClickStart = () => {
    commands.execute('docmanager:save-all');
    launch.isReady = false;
    model.changed.emit();
    requestAPI<any>('launch', { method: 'POST', body: formData })
      .then(d => {
        const { uri } = d;
        launch.uri = uri;
        model.changed.emit();
      })
      .catch(d => {
        model.error = d;
        model.changed.emit();
      });
  };
  const onClickStop = () => {
    clearIntervals();
    delete launch.isReady;
    delete launch.log;
    model.changed.emit();
    requestAPI<any>('launch', { method: 'DELETE', body: formData }).catch(d => {
      model.error = d;
      model.changed.emit();
    });
  };

  useEffect(() => {
    if (isReady === false && uri) {
      launchIntervalId = setInterval(() => {
        fetch(uri, { method: 'HEAD' }).then(() => {
          launch.isReady = true;
          model.changed.emit();
          clearInterval(launchIntervalId);
        });
      }, 1000);
    }
    if (isReady !== undefined) {
      logIntervalId = setInterval(() => {
        requestAPI<any>('log?type=launch&folder=' + folder).then(d => {
          if (launch.log?.timestamp !== d.timestamp) {
            launch.log = d;
            model.changed.emit();
          }
        });
      }, 2000);
    }
    return () => {
      clearIntervals();
    };
  }, [isReady, uri]);

  let link;
  if (isReady === undefined) {
    link = '';
  } else if (isReady === false) {
    link = 'Launching...';
  } else {
    link = (
      <a className="crosscompute-Link" href={uri} target="_blank">
        Development Server
      </a>
    );
  }
  const button =
    isReady === undefined ? (
      <button onClick={onClickStart}>Launch</button>
    ) : (
      <button onClick={onClickStop}>Stop</button>
    );
  const information =
    isReady !== undefined && log ? (
      <pre className="crosscompute-LaunchLog">{log.text}</pre>
    ) : (
      ''
    );
  return (
    <div className="crosscompute-LaunchPanel">
      <div className="crosscompute-LaunchControl">
        {link}
        {button}
      </div>
      {information}
    </div>
  );
};

const AutomationReference = (): JSX.Element => {
  return (
    <div className="crosscompute-AutomationReference">
      <a
        className="crosscompute-Link"
        href="https://docs.crosscompute.com"
        target="_blank"
      >
        CrossCompute Documentation
      </a>
    </div>
  );
};
