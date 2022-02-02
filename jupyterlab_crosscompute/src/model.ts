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

  private _configuration: AutomationConfiguration = new AutomationConfiguration('');
  private _changed = new Signal<this, void>(this);
}

export class AutomationConfiguration {
  constructor(name: string) {
    this.name = name;
  }

  name: string;
}
