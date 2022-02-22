import { Signal } from '@lumino/signaling';

export class AutomationModel {
  changed = new Signal<this, void>(this);
}
