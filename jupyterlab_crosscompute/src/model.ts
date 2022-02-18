import { Signal } from '@lumino/signaling';

export class AutomationModel {
  launch: ILaunchState | Record<string, never> = {};
  error: IAutomationError | Record<string, never> = {};
  changed = new Signal<this, void>(this);
}

export interface ILaunchState {
  path: string;
  folder: string;
  name: string;
  version: string;
  batches: IBatchDefinition[];
  uri: string;
  log: ILog | undefined;
  isReady: boolean | undefined;
}

interface IBatchDefinition {
  name: string;
  folder: string;
  configuration: { path: string };
}

interface ILog {
  text: string;
}

interface IAutomationError {
  message: string;
  code: number;
  path: string;
}
