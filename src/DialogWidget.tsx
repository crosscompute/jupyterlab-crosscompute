import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { Dialog } from '@jupyterlab/apputils';
import { NAMESPACE } from './constants';

export class ErrorWidget extends ReactWidget {
  constructor(reason: string | null) {
    super();
    this._reason = reason;
  }

  render(): JSX.Element {
    return <span>{this._reason}</span>;
  }

  private _reason: string;
}

export function ErrorDialogWidget(reason: string | null): any {
  const dialog = new Dialog({
    title: NAMESPACE + ' Error',
    body: new ErrorWidget(reason),
    host: document.body,
    buttons: [Dialog.okButton({ label: 'Close' })],
  });
  dialog.launch().catch(() => null);
  return dialog;
}

const ProgressBody = ReactWidget.create(
  <>
    <div className="jp-SpinnerContent" />
    <div style={{ textAlign: 'center' }}>
      <span>Running Automation...</span>
    </div>
  </>
);

export function ProgressDialogWidget(): any {
  const dialog = new Dialog({
    title: NAMESPACE,
    body: ProgressBody,
    host: document.body,
    buttons: [Dialog.okButton({ label: 'Close' })],
  });
  dialog.launch().catch(() => null);
  return dialog;
}
