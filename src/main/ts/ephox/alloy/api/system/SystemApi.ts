import { Contracts, Result } from '@ephox/katamari';
import { SugarElement } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SimulatedEvent, NativeSimulatedEvent } from 'ephox/alloy/events/SimulatedEvent';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';

export interface AlloySystemApi {
  addToGui: (AlloyComponent) => void;
  addToWorld: (AlloyComponent) => void;
  broadcast: (message: any) => void;
  broadcastOn: (channels: string[], message: any) => void;
  build: (spec: AlloySpec) => AlloyComponent;
  debugInfo: () => string;
  getByDom: (element: SugarElement) => Result<AlloyComponent, string>;
  getByUid: (uid: string) => Result<AlloyComponent, string>;
  removeFromGui: (component: AlloyComponent) => void;
  removeFromWorld: (component: AlloyComponent) => void;

  isConnected: () => boolean;
  // Weird method. Required?
  triggerEscape: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;

  
  triggerEvent: (eventName: string, target: SugarElement, data: {}) => void;
  triggerFocus: (target: SugarElement, originator: SugarElement) => void;
}

export type ContractAlloySystem = (AlloySystemApi) => AlloySystemApi;

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