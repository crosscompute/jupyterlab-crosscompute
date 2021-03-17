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
  url: string;
}

interface IEventResponseData {
  payload?: IPayload;
  index?: number;
  count?: number;
  result: any;
}

function EventComponent(props: any) {
  const event = props.event;
  return (
    <div style={{ border: '1px solid black', marginBottom: '1rem', padding: '1rem' }}>
      {Object.keys(event).map(key => {
        return (
          <div key={key}>
            {key}
            <pre>{JSON.stringify(event[key])}</pre>
          </div>
        );
      })}
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
        const newEvent = { Status: 'Download is ready' };
        setEvents((prevState: any) => [newEvent, ...prevState]);
        window.location.href = url;
      }
    }, RUN_AUTOMATION_POLLING_INTERVAL_IN_MILLISECONDS);
  }

  useEffect(() => {
    const settings = ServerConnection.makeSettings();
    const logsUrl = URLExt.join(settings.baseUrl, BASE_PATH, 'logs', logId);
    logSourceRef.current = new EventSource(logsUrl);
    logSourceRef.current.onmessage = function(e: any): void {
      const data: IEventResponseData = JSON.parse(e.data);
      const payload: IPayload = data.payload;
      console.log('check if download event', payload);
      if (payload) {
        console.log('downloadData called');
        downloadData(payload.url);
      }
      console.log(e);
      setEvents((prevState: any) => [data, ...prevState]);
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
      {events.map((eventData, index) => (
        <EventComponent key={index} event={eventData} />
      ))}
    </div>
  );
}
