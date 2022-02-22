import { Signal } from '@lumino/signaling';

export class AutomationModel {
  // Folder used for most recent update
  folder: string | null = null;

  // Error dictionary from extension server
  error?: IAutomationError | Record<string, never> = {};

  // Launch dictionary from extension server
  launch: ILaunchState | Record<string, never> = {};

  // Signal to refresh widget
  changed = new Signal<this, void>(this);
}

export interface ILaunchState {
  // Path to automation configuration
  path: string;

  // Folder containing automation configuration
  folder: string;

  // Name of automation
  name: string;

  // Version of automation
  version: string;

  // Batch definitions
  batches: IBatchDefinition[];

  // URI of automation server
  uri: string;

  // Log of automation server
  log?: ILog;

  // Flag indicating whether server is rady
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
