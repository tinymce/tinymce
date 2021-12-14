import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { BehaviourConfigAndState } from '../../behaviour/common/BehaviourBlob';
import { UncurriedHandler } from '../../events/EventRegistry';
import { AlloyBehaviour } from '../behaviour/Behaviour';
import { AlloySystemApi } from '../system/SystemApi';

type ReadonlyRecord<K extends keyof any, T> = {
  readonly [P in K]: T;
};

export interface AlloyComponent {
  readonly uid: string;
  readonly getSystem: () => AlloySystemApi;
  readonly config: (behaviour: AlloyBehaviour<any, any>) => Optional<BehaviourConfigAndState<any, any>>;
  readonly hasConfigured: (behaviour: AlloyBehaviour<any, any>) => boolean;
  readonly spec: any;
  readonly readState: (behaviourName: string) => any;
  readonly connect: (newApi: AlloySystemApi) => void;
  readonly disconnect: () => void;
  readonly getApis: <A>() => A;
  readonly element: SugarElement<any>;
  readonly syncComponents: () => void;
  readonly components: () => AlloyComponent[];
  readonly events: ReadonlyRecord<string, UncurriedHandler>;
}
