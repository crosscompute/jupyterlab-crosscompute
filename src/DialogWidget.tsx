import { ReactWidget } from '@jupyterlab/apputils';
import { Dialog } from '@jupyterlab/apputils';

import React from 'react';

export class ErrorWidget extends ReactWidget {
  constructor(reason: string | null) {
    super();
    this.addClass('crosscompute-DialogWidget');
    this._reason = reason;
  }

  render(): JSX.Element {
    return <span>{this._reason}</span>;
  }

  private _reason: string;
}

export function ErrorDialogWidget(reason: string | null): any {
  const dialog = new Dialog({
    title: 'CrossCompute Error',
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
      <span>Running Tool</span>
    </div>
  </>
);

export function ProgressDialogWidget(): any {
  const dialog = new Dialog({
    title: 'CrossCompute',
    body: ProgressBody,
    host: document.body,
    buttons: [Dialog.okButton({ label: 'Close' })],
  });
  dialog.launch().catch(() => null);

  return dialog;
}
