import { Contracts, Result } from '@ephox/katamari';

import { Element } from '@ephox/sugar';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

export interface AlloySystemApi {
  addToGui: (comp: AlloyComponent) => void;
  addToWorld: (comp: AlloyComponent) => void;
  broadcast: (message: any) => void;
  broadcastOn: (channels: string[], message: any) => void;
  build: (spec: AlloySpec) => AlloyComponent;
  debugInfo: () => string;
  getByDom: (element: Element) => Result<AlloyComponent, string | Error>;
  getByUid: (uid: string) => Result<AlloyComponent, string | Error>;
  removeFromGui: (component: AlloyComponent) => void;
  removeFromWorld: (component: AlloyComponent) => void;

  isConnected: () => boolean;
  // Weird method. Required?
  triggerEscape: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;

  triggerEvent: (eventName: string, target: Element, data: {}) => void;
  triggerFocus: (target: Element, originator: Element) => void;
}

export type ContractAlloySystem = (system: AlloySystemApi) => AlloySystemApi;

const SystemApi = Contracts.exactly([
  'debugInfo',
  'triggerFocus',
  'triggerEvent',
  'triggerEscape',
  // TODO: Implement later. See lab for details.
  // 'openPopup',
  // 'closePopup',
  'addToWorld',
  'removeFromWorld',
  'addToGui',
  'removeFromGui',
  'build',
  'getByUid',
  'getByDom',

  'broadcast',
  'broadcastOn',
  'isConnected'
]) as ContractAlloySystem;

export {
  SystemApi
};