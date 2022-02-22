import { ReactWidget, UseSignal } from '@jupyterlab/apputils';

import React from 'react';

import { logoIcon } from './constant';
import { AutomationModel } from './model';

export class AutomationBody extends ReactWidget {
  constructor(model: AutomationModel) {
    super();
    this._model = model;

    this.id = 'crosscompute-automation';
    this.addClass('crosscompute-Automation');

    const title = this.title;
    title.icon = logoIcon;
    title.caption = 'CrossCompute Automation';
  }

  render(): JSX.Element {
    console.log('RENDERING...', this._model);
    return (
      <UseSignal signal={this._model.changed} initialSender={this._model}>
        {() => (
          <AutomationControl
            model={this._model}
          />
        )}
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
  let content = '';
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
