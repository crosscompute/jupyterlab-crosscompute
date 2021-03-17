import React, { useEffect, useRef, useState } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { Dialog } from '@jupyterlab/apputils';
import {
  BASE_PATH,
  NAMESPACE,
  RUN_AUTOMATION_POLLING_INTERVAL_IN_MILLISECONDS,
} from './constants';

export function LogDialogWidget(logId: string | null): any {
  const dialog = new Dialog({
    title: NAMESPACE + ' Log',
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

interface IEventResponseData {
  status: string;
  data: any;
}

export function EventDoneComponent(props: any): JSX.Element {
  const data = props.data as IPayload;
  const { location } = data;
  return (
    <div>
      <h1>Done</h1>
      <p>
        Please wait for the download prompt or
        <a href={location}>click here</a>.
      </p>
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
  return (
    <div>
      <h1>
        Running... {data.index + 1}/{data.count}
      </h1>
      {renderPre(data.definition)}
    </div>
  );
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
  const [events, setEvents] = useState([]);

  function downloadData(url: string): void {
    console.log(url);
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
    const logsUrl = '/' + BASE_PATH + '/logs/' + logId;
    logSourceRef.current = new EventSource(logsUrl);
    logSourceRef.current.onmessage = function(e: any): void {
      console.log(e);
      const eventData: IEventResponseData = JSON.parse(
        e.data
      ) as IEventResponseData;
      console.log('message data', eventData);
      if (eventData.status === 'DONE') {
        console.log('downloadData called');
        const { data } = eventData;
        downloadData(data.location);
      }
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
    <div
      style={{
        maxHeight: '400px',
        maxWidth: '800px',
        overflow: 'auto',
      }}
    >
      {events.map((eventData, index) => {
        const { status, data } = eventData;
        if (status === 'DONE') {
          return <EventDoneComponent key={index} data={data} />;
        }
        if (status === 'RUNNING') {
          return <EventRunningComponent key={index} data={data} />;
        }
        return <EventErrorComponent key={index} data={data} />;
      })}
    </div>
  );
}
