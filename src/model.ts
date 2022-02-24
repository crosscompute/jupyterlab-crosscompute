import { Signal } from '@lumino/signaling';

export class AutomationModel {
  // Folder used for most recent update
  folder: string | null = null;

  // Error state from extension server
  error?: IAutomationError | Record<string, never> = {};

  // Launch state from extension server
  launch: ILaunchState | Record<string, never> = {};

  // Signal to refresh widget
  changed = new Signal<this, void>(this);
}

interface ILaunchState {
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

  // URI to automation server
  uri: string;

  // Log from automation server
  log?: ILog;

  // Flag indicating whether server is ready
  isReady?: boolean;
}

interface IBatchDefinition {
  folder: string;
  name: string;
  configuration: { path: string };
}

interface ILog {
  timestamp: number;
  text: string;
}

interface IAutomationError {
  message: string;
  code: number;
  path: string;
}
