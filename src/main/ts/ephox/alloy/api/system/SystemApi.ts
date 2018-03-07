import { Contracts, Result } from '@ephox/katamari';
import { RawUserSpec, SugarElement } from 'ephox/alloy/alien/TypeDefinitions';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface AlloySystemApi {
  addToGui: (AlloyComponent) => void;
  addToWorld: (AlloyComponent) => void;
  broadcast: (message: string) => void;
  broadcastOn: (channels: string, message: string) => void;
  build: (rawUserSpec: RawUserSpec) => AlloyComponent;
  debugInfo: () => string;
  getByDom: <SugarElement>(element: SugarElement) => Result<SugarElement, string>;
  getByUid: (uid: string) => Result<AlloyComponent, string>;
  removeFromGui: (component: AlloyComponent) => void;
  removeFromWorld: (component: AlloyComponent) => void;

  triggerEscape: (component: AlloyComponent, simulatedEvent: {}) => void;
  triggerEvent: (eventName: string, target: SugarElement, data: {}) => void;
  triggerFocus: (target: SugarElement, originator: SugarElement) => void;
}

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
  'broadcastOn'
]);

export {
  SystemApi
};