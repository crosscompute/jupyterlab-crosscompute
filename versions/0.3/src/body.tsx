import { ReactWidget } from '@jupyterlab/apputils';
import { UseSignal } from '@jupyterlab/ui-components';
import { ISignal, Signal } from '@lumino/signaling';
import React from 'react';
import { logoIcon } from './constant';
import { requestAPI } from './handler';

export class CrossComputePanel extends ReactWidget {
  private _curFile: string;
  private _curDir: string;
  private _config: { name: string; version: string };
  private _cache: any;
  private _stateChanged: Signal<this, void>;
  private _isRunning: boolean;
  private _log: string;

  private _onClickLaunch = () => {
    this._isRunning = true;
    // TODO: send launch request to launch endpoint

    // Wait until backend ready

    // Update log accordingly
    this._log = 'click launch button';
    this._stateChanged.emit();
  };

  private _onClickStop = () => {
    this._isRunning = false;

    // TODO: send stop request to launch endpoint

    // Wait until backend ready

    // Update log accordingly
    this._log = 'click stop button';
    this._stateChanged.emit();
  };

  constructor() {
    super();
    this.id = 'widget-id';
    this.addClass('jp-react-widget');

    const title = this.title;
    title.icon = logoIcon;
    this._curFile = '';
    this._curDir = '';
    this._config = {
      name: '',
      version: ''
    };
    this._cache = {};
    this._stateChanged = new Signal<this, void>(this);
    this._isRunning = false;
    this._log = '';
  }

  render(): JSX.Element {
    return (
      <UseSignal signal={this._stateChanged}>
        {(): JSX.Element => (
          <div>
            <div>Current File: {this._curFile}</div>
            <div>Current Dir: {this._curDir}</div>
            <div>Config:</div>
            <div>Name: {this._config.name}</div>
            <div>Version: {this._config.version}</div>
            {this._isRunning ? (
              <button onClick={this._onClickStop}>Stop</button>
            ) : (
              <button onClick={this._onClickLaunch}>Launch</button>
            )}

            <div>Running Log: </div>
            <div>{this._log}</div>
          </div>
        )}
      </UseSignal>
    );
  }

  // updatePath(curFile: string, curDir: string) {
  updatePath(currentPath: string) {
    // TODO: Update front end using cache
    /*
    this._curFile = curFile;
    this._curDir = curDir;

    console.log('Updated curFile:', this._curFile);
    console.log('Updated curDir:', this._curDir);
    */
    this._config = this._cache[currentPath] || {};
    this._stateChanged.emit();

    // requestAPI<any>('get-example?path=' + this._curFile)
    requestAPI<any>('get-example?path=' + currentPath)
      .then(data => {
        // TODO: Update cache using results from backend
        // TODO: Only update front end if backend results matches front end focus
        const { path } = data;
        this._cache[path] = data;
        if (path === currentPath) {
          this._config = data;
          this._stateChanged.emit();
        }
      })
      .catch(reason => {
        console.error(
          `The jupyterlab_crosscompute server extension appears to be missing.\n${reason}`
        );
      });
  }

  public get stateChanged(): ISignal<this, void> {
    return this._stateChanged;
  }
}
