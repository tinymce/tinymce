import { Result } from '@ephox/katamari';
import { Element, EventArgs } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

export interface AlloySystemApi {
  addToGui: (comp: AlloyComponent) => void;
  addToWorld: (comp: AlloyComponent) => void;
  broadcast: (message: any) => void;
  broadcastOn: (channels: string[], message: any) => void;
  broadcastEvent: (eventName: string, event: EventArgs) => void;
  build: (spec: AlloySpec) => AlloyComponent;
  debugInfo: () => string;
  getByDom: (element: Element) => Result<AlloyComponent, Error>;
  getByUid: (uid: string) => Result<AlloyComponent, Error>;
  removeFromGui: (component: AlloyComponent) => void;
  removeFromWorld: (component: AlloyComponent) => void;

  isConnected: () => boolean;
  // Weird method. Required?
  triggerEscape: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;

  triggerEvent: (eventName: string, target: Element, data: {}) => void;
  triggerFocus: (target: Element, originator: Element) => void;
}
