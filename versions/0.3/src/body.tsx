
import { ReactWidget, UseSignal } from '@jupyterlab/apputils';

import { Signal } from '@lumino/signaling';

import { logoIcon } from './constant';

import * as React from 'react';

import { requestAPI } from './handler';

export class ExampleWidget extends ReactWidget {
  private _openFolder: (folder: string) => void;
  private _openPath: (folder: string) => void;

  // Model properties
  private _folder: string | null;
  private _error: any;
  private _launch: any;
  private _changed: Signal<this, void>;

  constructor(
    openFolder: (folder: string) => void,
    openPath: (folder: string) => void
  ) {
    super();
    this.id = 'widget-id';

    const title = this.title;
    title.icon = logoIcon;

    this._openFolder = openFolder;
    this._openPath = openPath;

    // Initialize model properties
    this._folder = null;
    this._error = {};
    this._launch = {};
    this._changed = new Signal<this, void>(this);
  }

 // Set observing folder to new one
  updateModel(model: { folder: string }): void {
    const { folder } = model;
    let shouldUpdate = false;
    if (this._folder !== folder) {
      shouldUpdate = true;
    }
    if (this.isHidden || !shouldUpdate) {
      return;
    }
    this._folder = folder;

    requestAPI<any>('launch?folder=' + folder)
      .then(d => {
        delete this._error;
        this._launch = d;
        this._changed.emit();
      })
      .catch(d => {
        this._error = d;
        this._changed.emit();
      });
  };
  // A dummy function to surpass typescript requirements
  dummy(): void {
      if (!this._folder)
          return;
      console.log(this._openFolder(this._folder))
      console.log(this._openPath(this._folder))
      console.log(this._changed)
      console.log(this._launch)
  }
  goToDir(folder: string) {
      console.log('Before open:', folder);
      this._openFolder(folder);
  }
    
  render(): JSX.Element {
    return (
      <UseSignal signal={this._changed} initialSender={this}>
          {() => <div>Something goes here</div>}
      </UseSignal>
    );
  }
};

// class AutomationBody extends ReactWidget {
//   constructor(
//     commands: CommandRegistry,
//     openFolder: (folder: string) => void,
//     openPath: (folder: string) => void
//   ) {
//     super();
//     this._openFolder = openFolder;
//     this._openPath = openPath;
//     this.id = 'crosscompute-automation';

//     // Initialize model properties
//     this._folder = null;
//     this._error = {};
//     this._launch = {};
//     this._changed = new Signal<this, void>(this);
//   }

//   updateModel(model: { folder: string }): void {
//     const { folder } = model;
//     let shouldUpdate = false;
//     if (this._folder !== folder) {
//       shouldUpdate = true;
//     }
//     if (this.isHidden || !shouldUpdate) {
//       return;
//     }
//     this._folder = folder;
//     requestAPI<any>('launch?folder=' + folder)
//       .then(d => {
//         delete this._error;
//         this._launch = d;
//         this._changed.emit();
//       })
//       .catch(d => {
//         this._error = d;
//         this._changed.emit();
//       });
//   }

//   render(): JSX.Element {
//     return (
//       <UseSignal signal={this._changed} initialSender={this}>
//         {() => (
//           <AutomationControl
//             model={{
//               folder: this._folder,
//               error: this._error,
//               launch: this._launch,
//               changed: this._changed
//             }}
//             commands={this._commands}
//             openFolder={this._openFolder}
//             openPath={this._openPath}
//           />
//         )}
//       </UseSignal>
//     );
//   }

//   private _commands: CommandRegistry;
//   private _openFolder: (folder: string) => void;
//   private _openPath: (folder: string) => void;

//   // Model properties
//   private _folder: string | null;
//   private _error: IAutomationError | Record<string, never>;
//   private _launch: ILaunchState | Record<string, never>;
//   private _changed: Signal<this, void>;
// }
