import { ISignal, Signal } from '@lumino/signaling';

export class AutomationModel {
  get configuration(): AutomationConfiguration {
    return this._configuration;
  }

  set configuration(configuration: AutomationConfiguration) {
    this._configuration = configuration;
    this._error = new AutomationError();
    this._changed.emit();
  }

  get error(): AutomationError {
    return this._error;
  }

  set error(error: AutomationError) {
    this._error = error;
    this._changed.emit();
  }

  get changed(): ISignal<this, void> {
    return this._changed;
  }

  private _configuration: AutomationConfiguration =
    new AutomationConfiguration();
  private _error: AutomationError = new AutomationError();

  changed = new Signal<this, void>(this);
}

export class AutomationConfiguration {
  constructor(
    path = '',
    folder = '',
    uri = '',
    name = '',
    version = '',
    batches: IBatchDefinition[] = []
  ) {
    this.path = path;
    this.folder = folder;
    this.uri = uri;
    this.name = name;
    this.version = version;
    this.batches = batches;
  }

  path: string;
  folder: string;
  uri: string;
  name: string;
  version: string;
  batches: IBatchDefinition[];
}

interface IBatchDefinition {
  name: string;
  folder: string;
  configuration: { path: string };
}

export class AutomationError {
  constructor(message = '', code = 0) {
    this.message = message;
    this.code = code;
  }

  message: string;
  code: number;
}
