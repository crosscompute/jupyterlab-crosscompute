import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import React from 'react';

import { logoIcon } from './constant';
import { requestAPI } from './handler';
import { AutomationConfiguration, AutomationModel } from './model';

export class AutomationBody extends ReactWidget {
  constructor(
    model: AutomationModel,
    browserFactory: IFileBrowserFactory,
    docManager: IDocumentManager
  ) {
    super();
    this._model = model;
    this._browserFactory = browserFactory;
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

  onUpdate(isDirty?: boolean): void {
    if (isDirty) {
      this._isDirty = true;
    }
    if (this.isHidden || !this._isDirty) {
      return;
    }
    const { path } = this._browserFactory.defaultBrowser.model;
    console.log('RENDER!!');

    requestAPI<any>('launch?folder=' + path)
      .then(d => {
        this._model.configuration = new AutomationConfiguration(
          d.path,
          d.name,
          d.version
        );
      })
      .catch(d => {
        console.error(d.message);
      });

    this._isDirty = false;
  }

  private _model: AutomationModel;
  private _browserFactory: IFileBrowserFactory;
  private _docManager: IDocumentManager;
  private _isDirty = false;
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
