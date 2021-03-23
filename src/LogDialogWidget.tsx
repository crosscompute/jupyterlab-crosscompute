import React, { useEffect, useRef, useState } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { Dialog } from '@jupyterlab/apputils';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import {
  NAME,
  NAMESPACE,
  RUN_AUTOMATION_POLLING_INTERVAL_IN_MILLISECONDS
} from './constants';

export function LogDialogWidget(logId: string | null): any {
  const dialog = new Dialog({
    title: NAME + ' Automation',
    body: new LogWidget(logId),
    host: document.body,
    buttons: [Dialog.okButton({ label: 'Close' })]
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
  isReady: boolean;
}

interface IEvent {
  type: string;
  data: any;
}

export function ProgressArea(props: any): JSX.Element {
  const { data } = props;
  if (!data) {
    return null;
  }
  const frames = Object.entries(data.frames || {}).map(
    ([frameIndex, frameData]: [any, any]) => {
      const {
        series: frameSeries,
        status: frameStatus,
        name: frameName
      } = frameData;
      let series;
      if (frameStatus !== 'DONE' && frameSeries !== undefined) {
        series = Object.entries(frameSeries || {}).map(
          ([seriesIndex, seriesData]: [any, any]) => {
            const { status: seriesStatus, name: seriesName } = seriesData;
            return (
              <div key={seriesIndex}>
                [{seriesStatus}] {seriesName}
              </div>
            );
          }
        );
      }
      return (
        <div key={frameIndex}>
          <h2>
            [{frameStatus}] {frameName}
          </h2>
          {series}
        </div>
      );
    }
  );
  return (
    <div>
      <h1>Progress</h1>
      {frames}
    </div>
  );
}

export function ErrorArea(props: any): JSX.Element {
  const { data } = props;
  if (!data) {
    return null;
  }
  return (
    <div>
      <h1>Error</h1>
      {typeof data === 'string' ? data : renderPre(data)}
    </div>
  );
}

export function DoneArea(props: any): JSX.Element {
  const data = props.data as IPayload;
  if (!data) {
    return null;
  }
  const { url, isReady } = data;
  const style: any = isReady && {
    fontWeight: 'bold'
  };
  return (
    <div>
      <h1>Done</h1>
      <a href={url} target="_blank" style={style}>
        {isReady
          ? 'Click here to download'
          : 'Please wait for the download prompt'}
      </a>
      .
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
  const [progressData, setProgressData] = useState({});
  const [errorData, setErrorData] = useState();
  const [doneData, setDoneData] = useState();

  useEffect(() => {
    const settings = ServerConnection.makeSettings();
    const logsUrl = URLExt.join(settings.baseUrl, NAMESPACE, 'logs', logId);
    logSourceRef.current = new EventSource(logsUrl);
    logSourceRef.current.onmessage = function (e: any): void {
      console.log(e);
      const event: IEvent = JSON.parse(e.data) as IEvent;
      const { type: eventType, data: eventData } = event;
      switch (eventType) {
        case 'PROGRESS': {
          const { index, status, name } = eventData;
          const [frameIndex, seriesIndex] = index;
          setProgressData((oldPanel: any) => {
            const oldFrames = oldPanel.frames || {};
            const oldFrame = oldFrames[frameIndex] || {};
            const newFrame: any = {};
            if (seriesIndex === undefined) {
              if (status !== undefined) {
                newFrame.status = status;
              }
              if (name !== undefined) {
                newFrame.name = name;
              }
            } else {
              const oldSeries = oldFrame.series || {};
              const oldSerie = oldSeries[seriesIndex] || {};
              const newSerie: any = {};
              if (status !== undefined) {
                newSerie.status = status;
              }
              if (name !== undefined) {
                newSerie.name = name;
              }
              newFrame.series = {
                ...oldSeries,
                [seriesIndex]: { ...oldSerie, ...newSerie }
              };
            }
            return {
              ...oldPanel,
              ...{
                frames: {
                  ...oldFrames,
                  [frameIndex]: { ...oldFrame, ...newFrame }
                }
              }
            };
          });
          break;
        }
        case 'ERROR': {
          setErrorData(eventData);
          logSourceRef.current.close();
          break;
        }
        case 'DONE': {
          setDoneData(eventData);
          const { url } = eventData;
          const pollingIntervalId = setInterval(async () => {
            const response = await fetch(url, { method: 'HEAD' });
            const status = response.status;
            if (status === 200) {
              clearInterval(pollingIntervalId);
              setDoneData({ ...eventData, isReady: true });
              window.location.href = url;
            }
          }, RUN_AUTOMATION_POLLING_INTERVAL_IN_MILLISECONDS);
          logSourceRef.current.close();
          break;
        }
      }
    };

    return (): void => {
      console.log('closing connection');
      if (logSourceRef.current) {
        logSourceRef.current.close();
        console.log('connection closed');
      }
    };
  }, []);

  return (
    <div style={{ maxHeight: '100%', maxWidth: '100%', overflow: 'auto' }}>
      <ErrorArea data={errorData} />
      <DoneArea data={doneData} />
      <ProgressArea data={progressData} />
    </div>
  );
}
