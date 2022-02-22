import { Signal } from '@lumino/signaling';

export class AutomationModel {
  folder: string | null = null;
  changed = new Signal<this, void>(this);
}
