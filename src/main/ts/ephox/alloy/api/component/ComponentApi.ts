import { Contracts, Result } from '@ephox/katamari';
import { AlloySystemApi } from 'ephox/alloy/api/system/SystemApi';
import { SugarElement } from 'ephox/alloy/alien/TypeDefinitions';
import { EventHandlerConfig } from 'ephox/alloy/api/events/AlloyEvents';
import { AlloyBehaviourConfig, AlloyBehaviour } from 'ephox/alloy/api/behaviour/Behaviour';

export interface AlloyComponent {
  getSystem: () => AlloySystemApi;
  config: (config: AlloyBehaviourConfig) => AlloyBehaviour;
  hasConfigured: (behaviour) => boolean;
  spec: () => any;
  readState: (behaviourName: string) => any;
  connect: (newApi) => void;
  disconnect: () => void;
  element: () => SugarElement;
  syncComponents: () => void;
  components: () => any;
  events: () => EventHandlerConfig;
}

const ComponentApi = Contracts.exactly([
  'getSystem',
  'config',
  'hasConfigured',
  'spec',
  'connect',
  'disconnect',
  'element',
  'syncComponents',
  'readState',
  'components',
  'events'
]);

export {
  ComponentApi
};