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
    return (
      <UseSignal signal={this._model.changed} initialSender={this._model}>
        {(): JSX.Element => <AutomationComponent model={this._model} />}
      </UseSignal>
    );
  }

  private _model: AutomationModel;
}

const AutomationComponent = ({
  model
}: {
  model: AutomationModel;
}): JSX.Element => {
  const { configuration } = model;
  const { name } = configuration;
  if (!name) {
    return <h1>Hey</h1>;
  }
  return <h1>Welcome! {name}</h1>;
};
