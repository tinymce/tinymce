import { Processor } from '@ephox/boulder';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface ReceivingBehaviour extends Behaviour.AlloyBehaviour<ReceivingConfigSpec, ReceivingConfig> {
  config: (config: ReceivingConfigSpec) => Behaviour.NamedConfiguredBehaviour<ReceivingConfigSpec, ReceivingConfig>;
}

export interface ReceivingConfig extends Behaviour.BehaviourConfigDetail {
  channels: {
    [ key: string ]: {
      schema: Processor;
      onReceive: (comp: AlloyComponent, message: any) => void;
    }
  };
}

export interface ReceivingConfigSpec extends Behaviour.BehaviourConfigSpec {
  channels: {
    [ key: string]: {
      onReceive: (comp: AlloyComponent, message: any) => void;
      schema?: Processor;
    }
  };
}
