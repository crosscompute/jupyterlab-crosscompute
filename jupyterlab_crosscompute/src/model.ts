import { Signal } from '@lumino/signaling';

export class AutomationModel {
  folder: string | null = null;
  error?: IAutomationError | Record<string, never> = {};
  launch: ILaunchState | Record<string, never> = {};
  changed = new Signal<this, void>(this);
}

export interface ILaunchState {
  path: string;
  folder: string;
  name: string;
  version: string;
  batches: IBatchDefinition[];
  uri: string;
  log?: ILog;
  isReady?: boolean;
}

interface IBatchDefinition {
  folder: string;
  name: string;
  configuration: { path: string };
}

interface ILog {
  text: string;
}

export interface IAutomationError {
  message: string;
  code: number;
  path: string;
}
