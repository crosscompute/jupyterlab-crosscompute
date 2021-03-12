import React, { useState } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { Dialog } from '@jupyterlab/apputils';
import { NAMESPACE } from './constants';

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

export function LogComponent({ logId }: { logId: string }): JSX.Element {
  const [text, setText] = useState();
  const logsUrl = '/logs/' + logId;
  const logSource = new EventSource(logsUrl);
  logSource.onmessage = function(e): void {
    console.log(e);
    setText(e);
  };

  return <pre style={{ maxHeight: '10em', overflow: 'auto' }}>{text}</pre>;
}
