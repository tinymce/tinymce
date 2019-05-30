import { Element } from '@ephox/sugar';

import { AlloyBehaviour } from '../../api/behaviour/Behaviour';
import { AlloySystemApi } from '../../api/system/SystemApi';
import { UncurriedHandler } from '../../events/EventRegistry';

export interface AlloyComponent {
  getSystem: () => AlloySystemApi;
  config: <D>(behaviour: AlloyBehaviour<any, D>) => D | any;
  hasConfigured: (behaviour) => boolean;
  spec: () => any;
  readState: (behaviourName: string) => any;
  connect: (newApi) => void;
  disconnect: () => void;
  getApis: <A>() => A;
  element: () => Element;
  syncComponents: () => void;
  components: () => AlloyComponent[];
  events: () => Record<string, UncurriedHandler>;
}