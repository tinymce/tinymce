import { Contracts } from '@ephox/katamari';
import { AlloyBehaviour, AlloyBehaviourConfig, SugarElement } from 'ephox/alloy/alien/TypeDefinitions';

export interface AlloyComponent {
  getSystem: () => AlloyComponent;
  config: (config: AlloyBehaviourConfig) => AlloyBehaviour;
  hasConfigured: (behaviour) => boolean;
  spec: () => any;
  readState: (behaviourName: string) => any;
  connect: (newApi) => void;
  disconnect: () => void;
  element: () => SugarElement;
  syncComponents: () => void;
  components: () => any;
  events: () => {};
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