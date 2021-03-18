import React, { useEffect, useRef, useState } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { Dialog } from '@jupyterlab/apputils';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import {
  BASE_PATH,
  NAMESPACE,
  RUN_AUTOMATION_POLLING_INTERVAL_IN_MILLISECONDS,
} from './constants';

export function LogDialogWidget(logId: string | null): any {
  const dialog = new Dialog({
    title: NAMESPACE + ' Automation',
    body: new LogWidget(logId),
    host: document.body,
    buttons: [Dialog.okButton({ label: 'Cancel' })],
  });
  dialog.launch().catch(() => null);
  return dialog;
}

export class LogWidget extends ReactWidget {
  constructor(logId: string) {
    super();
    this.logId = logId;
  }

  render(): JSX.Element {
    return <LogComponent logId={this.logId} />;
  }

  private logId: string;
}

interface IPayload {
  location: string;
}

interface IEvent {
  status: string;
  data: any;
}

export function EventDoneComponent(props: any): JSX.Element {
  const data = props.data as IPayload;
  const { location } = data;
  return (
    <div>
      <h1>Done</h1>
      <a href={location} target='_blank'>
        Please wait for the download prompt or click here
      </a>
      .
    </div>
  );
}

export function EventErrorComponent(props: any): JSX.Element {
  const data = props.data;
  return (
    <div>
      <h1>Failed</h1>
      {typeof data === 'string' ? data : renderPre(data)}
    </div>
  );
}

export function EventRunningComponent(props: any): JSX.Element {
  const data = props.data;
  return <div>{typeof data === 'string' ? data : renderPre(data)}</div>;
}

function renderPre(obj: any): JSX.Element[] {
  return Object.entries(obj).map(([key, value]) => (
    <div key={key}>
      <h3>{key}</h3>
      <pre>{typeof value === 'string' ? value : JSON.stringify(value)}</pre>
    </div>
  ));
}

export function LogComponent({ logId }: { logId: string }): JSX.Element {
  const logSourceRef = useRef<any>();
  const [alertData, setAlertData] = useState();
  const [downloadUrl, setDownloadUrl] = useState();
  const [progressTable, setProgressTable] = useState({});

  function downloadData(url: string): void {
    const pollingIntervalId = setInterval(async () => {
      const response = await fetch(url, { method: 'HEAD' });
      const status = response.status;
      if (status === 200) {
        clearInterval(pollingIntervalId);
        window.location.href = url;
      }
    }, RUN_AUTOMATION_POLLING_INTERVAL_IN_MILLISECONDS);
  }

  useEffect(() => {
    const settings = ServerConnection.makeSettings();
    const logsUrl = URLExt.join(settings.baseUrl, BASE_PATH, 'logs', logId);
    logSourceRef.current = new EventSource(logsUrl);
    logSourceRef.current.onmessage = function(e: any): void {
      console.log(e);
      const event: IEvent = JSON.parse(e.data) as IEvent;
      const { status: eventStatus, data: eventData } = event;
      switch (eventStatus) {
        case 'UPDATE': {
          const { index, status, name } = eventData;
          const [ outerIndex, innerIndex ] = index;
          setProgressTable(function (oldTable: any) {
          })
          setProgressTable((oldTable: any) => ({...oldTable, ...{
            [outerIndex]: { index: innerIndex, status, name },
          }));
        }
        case 'ALERT': {
          setAlertData(eventData);
        }
        case 'DOWNLOAD': {
          const { url } = eventData;
          downloadData(url);
          setDownloadUrl(url);
          break;
        }
      }
      event.data
      setState
      setEvents((prevState: any) => [eventData, ...prevState]);
    };

    return (): void => {
      console.log('closing connection');
      if (logSourceRef.current) {
        logSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div style={{maxHeight: '100%', maxWidth: '100%', overflow: 'auto'}}>
      {Object.entries(state).map((outerIndex, outerData) => {
        return (
        );
      })}

      {events.length
        ? events.map((eventData, eventIndex) => {
            const { status, data } = eventData;
            switch (status) {
              case 'RUNNING':
                return <EventRunningComponent key={eventIndex} data={data} />;
              case 'ERROR':
                return <EventErrorComponent key={eventIndex} data={data} />;
              case 'DONE':
                return <EventDoneComponent key={eventIndex} data={data} />;
            }
          })
        : 'Your report is being generated. Please be patient.'}
    </div>
  );
}
