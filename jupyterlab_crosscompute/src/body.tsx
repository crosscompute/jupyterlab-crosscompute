import { ReactWidget } from '@jupyterlab/apputils';
import React, { useEffect, useState } from 'react';

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
    return <AutomationComponent model={this._model} />;
  }

  private _model: AutomationModel;
}

const AutomationComponent = ({
  model
}: {
  model: AutomationModel;
}): JSX.Element => {
  const [configuration, setConfiguration] = useState({
    name: model.configuration.name
  });

  useEffect(() => {
    const updateConfiguration = (model: AutomationModel): void => {
      setConfiguration(model.configuration);
    };

    model.changed.connect(updateConfiguration);

    return (): void => {
      model.changed.disconnect(updateConfiguration);
    };
  });

  return <>Welcome! {configuration.name}</>;
};
