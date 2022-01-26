import { Dialog } from '@jupyterlab/apputils';

export function ErrorDialogWidget(error: any): any {
  const dialog = new Dialog({
    title: 'Error',
    body: error.message,
    host: document.body,
    buttons: [Dialog.okButton({ label: 'Ok' })]
  });
  dialog.launch().catch(() => null);
  return dialog;
}
