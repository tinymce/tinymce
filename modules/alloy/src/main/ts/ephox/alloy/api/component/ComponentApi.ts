import { Option } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { BehaviourConfigAndState } from '../../behaviour/common/BehaviourBlob';
import { UncurriedHandler } from '../../events/EventRegistry';
import { AlloyBehaviour } from '../behaviour/Behaviour';
import { AlloySystemApi } from '../system/SystemApi';

export interface AlloyComponent {
  getSystem: () => AlloySystemApi;
  config: (behaviour: AlloyBehaviour<any, any>) => Option<BehaviourConfigAndState<any, any>>;
  hasConfigured: (behaviour: AlloyBehaviour<any, any>) => boolean;
  spec: () => any;
  readState: (behaviourName: string) => any;
  connect: (newApi: AlloySystemApi) => void;
  disconnect: () => void;
  getApis: <A>() => A;
  element: () => SugarElement;
  syncComponents: () => void;
  components: () => AlloyComponent[];
  events: () => Record<string, UncurriedHandler>;
}
