import type { Optional, Result } from '@ephox/katamari';
import type { EventArgs, SugarElement } from '@ephox/sugar';

import type { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import type { AlloyComponent } from '../component/ComponentApi';
import type { AlloySpec } from '../component/SpecTypes';

export interface AlloySystemApi {
  addToGui: (comp: AlloyComponent) => void;
  addToWorld: (comp: AlloyComponent) => void;
  broadcast: (message: any) => void;
  broadcastOn: (channels: string[], message: any) => void;
  broadcastEvent: (eventName: string, event: EventArgs) => void;
  build: (spec: AlloySpec) => AlloyComponent;
  buildOrPatch: (spec: AlloySpec, optObsoleted: Optional<SugarElement<Node>>) => AlloyComponent;
  debugInfo: () => string;
  getByDom: (element: SugarElement<Node>) => Result<AlloyComponent, Error>;
  getByUid: (uid: string) => Result<AlloyComponent, Error>;
  removeFromGui: (component: AlloyComponent) => void;
  removeFromWorld: (component: AlloyComponent) => void;

  isConnected: () => boolean;
  // Weird method. Required?
  triggerEscape: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;

  triggerEvent: (eventName: string, target: SugarElement<Node>, data: {}) => void;
  triggerFocus: (target: SugarElement<HTMLElement>, originator: SugarElement<Node>) => void;
}
