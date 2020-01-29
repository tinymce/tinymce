import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import { AlloyBehaviour } from '../../api/behaviour/Behaviour';
import { AlloySystemApi } from '../../api/system/SystemApi';
import { BehaviourConfigAndState } from '../../behaviour/common/BehaviourBlob';
import { UncurriedHandler } from '../../events/EventRegistry';

export interface AlloyComponent {
  getSystem: () => AlloySystemApi;
  config: (behaviour: AlloyBehaviour<any, any>) => Option<BehaviourConfigAndState<any, any>>;
  hasConfigured: (behaviour: AlloyBehaviour<any, any>) => boolean;
  spec: () => any;
  readState: (behaviourName: string) => any;
  connect: (newApi: AlloySystemApi) => void;
  disconnect: () => void;
  getApis: <A>() => A;
  element: () => Element;
  syncComponents: () => void;
  components: () => AlloyComponent[];
  events: () => Record<string, UncurriedHandler>;
}
