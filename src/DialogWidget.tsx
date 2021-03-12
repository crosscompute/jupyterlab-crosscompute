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
    buttons: [Dialog.okButton({ label: 'Close' })],
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

export function LogComponent({ logId }: { logId: string }): JSX.Element {
  const logSourceRef = useRef<any>();
  const [text, setText] = useState('');

  function downloadData(url: string): void {
    console.log(url);
    const pollingIntervalId = setInterval(async () => {
      const response = await fetch(url, { method: 'HEAD' });
      const status = response.status;
      if (status === 200) {
        clearInterval(pollingIntervalId);
        setText((prevState: string) => 'Download is ready' + '\n' + prevState);
        window.location.href = url;
      }
    }, RUN_AUTOMATION_POLLING_INTERVAL_IN_MILLISECONDS);
  }

  useEffect(() => {
    const logsUrl = '/' + BASE_PATH + '/logs/' + logId;
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
      setText((prevState: string) => JSON.stringify(data) + '\n' + prevState);
    };
    return (): void => {
      console.log('closing connection');
      if (logSourceRef.current) {
        logSourceRef.current.close();
      }
    };
  }, []);

  return (
    <pre
      style={{
        maxHeight: '10em',
        maxWidth: '800px',
        overflow: 'auto',
      }}
    >
      {text}
    </pre>
  );
}
