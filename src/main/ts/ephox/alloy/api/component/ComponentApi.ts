import { Contracts, Result } from '@ephox/katamari';
import { AlloySystemApi } from '../../api/system/SystemApi';
import { SugarElement } from '../../alien/TypeDefinitions';
import { EventHandlerConfig, EventHandlerConfigRecord } from '../../api/events/AlloyEvents';
import { AlloyBehaviourConfig, AlloyBehaviour } from '../../api/behaviour/Behaviour';
import { UncurriedHandler } from 'ephox/alloy/events/EventRegistry';

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
  events: () => Record<string, UncurriedHandler>;
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