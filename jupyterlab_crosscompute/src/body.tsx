import { ReactWidget, UseSignal } from '@jupyterlab/apputils';

import React from 'react';

import { logoIcon } from './constant';
import { AutomationModel } from './model';

export class AutomationBody extends ReactWidget {
  constructor() {
    super();
    this._model = new AutomationModel();

    this.id = 'crosscompute-automation';
    this.addClass('crosscompute-Automation');

    const title = this.title;
    title.icon = logoIcon;
    title.caption = 'CrossCompute Automation';
  }

  updateModel(model: { folder: string }): void {
    const { folder } = model;

    let shouldUpdate = false;
    if (this._model.folder !== folder) {
      shouldUpdate = true;
    }
    if (this.isHidden || !shouldUpdate) {
      return;
    }

    this._model.folder = folder;
    this._model.changed.emit();
    console.debug('AutomationBody.updateModel UPDATE');
  }

  render(): JSX.Element {
    console.debug('AutomationBody.render');
    return (
      <UseSignal signal={this._model.changed} initialSender={this._model}>
        {() => <AutomationControl model={this._model} />}
      </UseSignal>
    );
  }

  private _model: AutomationModel;
}

const AutomationControl = ({
  model
}: {
  model: AutomationModel;
}): JSX.Element => {
  console.debug('AutomationControl.render');
  const content = model.folder;
  const reference = (
    <div className="crosscompute-AutomationReference">
      <a
        className="crosscompute-Link"
        href="https://d.crosscompute.com"
        target="_blank"
      >
        CrossCompute Documentation
      </a>
    </div>
  );
  return (
    <>
      {content}
      {reference}
    </>
  );
};
