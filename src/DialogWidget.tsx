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
      Completed
      <pre>Download link: {location}</pre>
    </div>
  );
}

function renderPre(obj: any): JSX.Element[] {
  return Object.keys(obj).map(key => {
    return (
      <div key={key}>
        <pre>{key}</pre>
        {typeof obj[key] === 'string' ? (
          <pre>{obj[key]}</pre>
        ) : (
          <pre>{JSON.stringify(obj[key])}</pre>
        )}
      </div>
    );
  });
}

export function EventErrorComponent(props: any): JSX.Element {
  const data = props.data;

  if (typeof data === 'string') {
    return (
      <div>
        <pre>{data}</pre>
      </div>
    );
  }

  return (
    <div>
      { /*
      {data.stderr && <pre>{data.stderr}</pre>}
      {data.stdout && <pre>{data.stdout}</pre>}
         */}
      {renderPre(data)}
    </div>
  );
}

export function EventRunningComponent(props: any): JSX.Element {
  const data = props.data;
  return (
    <div>
      Running... {data.index}/{data.count}
      {renderPre(data.definition)}
    </div>
  );
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
