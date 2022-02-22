import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { FileBrowserModel } from '@jupyterlab/filebrowser';
import React, { useEffect, useState } from 'react';

import { CommandIDs, ErrorCode, logoIcon } from './constant';
import { requestAPI } from './handler';
import { AutomationModel, ILaunchState } from './model';

const AutomationControl = ({
  model,
  commands,
  openPath,
  openFolder
}: {
  model: AutomationModel;
  commands: CommandRegistry;
}): JSX.Element => {
  if (error.message) {
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
          <div className="crosscompute-AutomationName">{name || 'No Name'}</div>
          <div className="crosscompute-AutomationVersion">
            {version || 'No Version'}
          </div>
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
          <Launch state={launch} commands={commands} />
        </div>
      </div>
    );
  } else {
    content = '';
  }
};

const Launch = ({
  state,
  commands
}: {
  state: ILaunchState | Record<string, never>;
  commands: CommandRegistry;
}): JSX.Element => {
  const { folder, uri } = state;
  const [isReady, setIsReady] = useState(state.isReady);
  const [log, setLog] = useState(state.log);
  let launchIntervalId: number, logIntervalId: number;

  const clearIntervals = () => {
    console.log('clearIntervals');
    clearInterval(launchIntervalId);
    clearInterval(logIntervalId);
  };

  const onClickStart = () => {
    commands.execute(CommandIDs.launchStart).catch(reason => {
      console.error(`could not start launch: ${reason}`);
    });
  };
  const onClickStop = () => {
    commands.execute(CommandIDs.launchStop).catch(reason => {
      console.error(`could not stop launch: ${reason}`);
    });
    clearIntervals();
  };
  console.log('RENDERING...', folder, uri, isReady, log);

  useEffect(() => {
    console.log('useEffect', isReady, uri);
    if (isReady === false && uri) {
      console.log('checking...');
      launchIntervalId = setInterval(() => {
        fetch(uri, { method: 'HEAD' }).then(() => {
          console.log('ready');
          setIsReady(true);
          clearInterval(launchIntervalId);
        });
      }, 1000);
    }
    if (isReady !== undefined) {
      console.log('logging...');
      logIntervalId = setInterval(() => {
        requestAPI<any>('log?folder=' + folder).then(d => {
          console.log('log');
          setLog({ text: d.text });
        });
      }, 3000);
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
    <div className="crosscompute-Launch">
      <div className="crosscompute-LaunchControl">
        {link}
        {button}
      </div>
      {information}
    </div>
  );
};
