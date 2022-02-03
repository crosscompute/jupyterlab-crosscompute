import { ISignal, Signal } from '@lumino/signaling';

export class AutomationModel {
  get configuration(): AutomationConfiguration {
    return this._configuration;
  }

  set configuration(configuration: AutomationConfiguration) {
    this._configuration = configuration;
    this._changed.emit();
  }

  get changed(): ISignal<this, void> {
    return this._changed;
  }

  public isDirty = false;
  private _configuration: AutomationConfiguration =
    new AutomationConfiguration();
  private _changed = new Signal<this, void>(this);
}

export class AutomationConfiguration {
  constructor(path = '', name = '', version = '') {
    this.path = path;
    this.name = name;
    this.version = version;
  }

  path: string;
  name: string;
  version: string;
}
