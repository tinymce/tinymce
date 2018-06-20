import { Contracts, Result } from '@ephox/katamari';
import { AlloySystemApi } from '../../api/system/SystemApi';
import { SugarElement } from '../../alien/TypeDefinitions';
import { AlloyEventKeyAndHandler, AlloyEventRecord } from '../../api/events/AlloyEvents';
import { AlloyBehaviourConfig, AlloyBehaviour } from '../../api/behaviour/Behaviour';
import { UncurriedHandler } from '../../events/EventRegistry';

export interface AlloyComponent {
  getSystem: () => AlloySystemApi;
  config: <D>(behaviour: AlloyBehaviour<any,D>) => D | any
  hasConfigured: (behaviour) => boolean;
  spec: () => any;
  readState: (behaviourName: string) => any;
  connect: (newApi) => void;
  disconnect: () => void;
  element: () => SugarElement;
  syncComponents: () => void;
  components: () => AlloyComponent[];
  events: () => Record<string, UncurriedHandler>;
}

const ComponentApi: (spec) => AlloyComponent = Contracts.exactly([
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