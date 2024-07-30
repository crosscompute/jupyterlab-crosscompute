import { ReactWidget } from '@jupyterlab/apputils';
import { UseSignal } from '@jupyterlab/ui-components';
import { ISignal, Signal } from '@lumino/signaling';
import React from 'react';
import { logoIcon } from './constant';
import { requestAPI } from './handler';

/*
const TestComponent = (): JSX.Element => {
    return (
        <div>
        <p>Test Component</p>
        </div>
    )
}
*/

export class CrossComputePanel extends ReactWidget {
  private _curFile;
  private _curDir;
  constructor() {
    super();
    this.id = 'widget-id';
    this.addClass('jp-react-widget');

    const title = this.title;
    title.icon = logoIcon;
    this._curFile = '';
    this._curDir = '';
  }
  render(): JSX.Element {
    // return <TestComponent />;
    return (
      <UseSignal signal={this._stateChanged}>
        {(): JSX.Element => (
          <div>
            <div>Currrent File: {this._curFile}</div>
            <div>Currrent Dir: {this._curDir}</div>
          </div>
        )}
      </UseSignal>
    );
  }

  updatePath(curFile: string, curDir: string) {
    this._curFile = curFile;
    this._curDir = curDir;

    console.log('Updated curFile:', this._curFile);
    console.log('Updated curDir:', this._curDir);
    this._stateChanged.emit();
    requestAPI<any>('get-example?path=' + this._curFile)
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The jupyterlab_crosscompute server extension appears to be missing.\n${reason}`
        );
      });
  }

  private _stateChanged = new Signal<this, void>(this);
  public get stateChanged(): ISignal<this, void> {
    return this._stateChanged;
  }
}

