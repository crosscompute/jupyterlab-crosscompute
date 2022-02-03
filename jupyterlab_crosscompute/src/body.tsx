import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import React from 'react';
import { IDocumentManager } from '@jupyterlab/docmanager';

import { logoIcon } from './constant';
import { AutomationModel } from './model';

export class AutomationBody extends ReactWidget {
  constructor(model: AutomationModel, docManager: IDocumentManager) {
    super();
    this._model = model;
    this._docManager = docManager;

    this.id = 'crosscompute-automation';
    this.addClass('crosscompute-Automation');

    const title = this.title;
    title.icon = logoIcon;
    title.caption = 'CrossCompute Automation';
  }

  render(): JSX.Element {
    return (
      <UseSignal signal={this._model.changed} initialSender={this._model}>
        {() => (
          <AutomationComponent
            model={this._model}
            docManager={this._docManager}
          />
        )}
      </UseSignal>
    );
  }

  private _model: AutomationModel;
  private _docManager: IDocumentManager;
}

const AutomationComponent = ({
  model,
  docManager
}: {
  model: AutomationModel;
  docManager: IDocumentManager;
}): JSX.Element => {
  const { configuration } = model;
  const { path, name, version } = configuration;

  function onClickEditConfiguration() {
    docManager.openOrReveal(path);
  }

  if (!name) {
    return <>CrossCompute Analytics Automation Framework</>;
  }
  return (
    <>
      <div className="crosscompute-AutomationHeader">
        <div className="crosscompute-AutomationName">{name}</div>
        <div className="crosscompute-AutomationVersion">{version}</div>
      </div>
      <div>
        <a
          className="crosscompute-AutomationEdit"
          onClick={onClickEditConfiguration}
        >
          Edit Configuration
        </a>
      </div>
    </>
  );
};
