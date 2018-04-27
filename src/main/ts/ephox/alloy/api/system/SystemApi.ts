import { Contracts, Result } from '@ephox/katamari';
import { SugarElement } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchSpec } from '../../api/ui/Sketcher';

export interface AlloySystemApi {
  addToGui: (AlloyComponent) => void;
  addToWorld: (AlloyComponent) => void;
  broadcast: (message: string) => void;
  broadcastOn: (channels: string[], message: any) => void;
  build: (rawUserSpec: SketchSpec) => AlloyComponent;
  debugInfo: () => string;
  getByDom: <SugarElement>(element: SugarElement) => Result<SugarElement, string>;
  getByUid: (uid: string) => Result<AlloyComponent, string>;
  removeFromGui: (component: AlloyComponent) => void;
  removeFromWorld: (component: AlloyComponent) => void;

  triggerEscape: (component: AlloyComponent, simulatedEvent: {}) => void;
  triggerEvent: (eventName: string, target: SugarElement, data: {}) => void;
  triggerFocus: (target: SugarElement, originator: SugarElement) => void;
}

export type AlloySystem = (AlloySystemApi) => AlloySystemApi;

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
]) as AlloySystem;

export {
  SystemApi
};