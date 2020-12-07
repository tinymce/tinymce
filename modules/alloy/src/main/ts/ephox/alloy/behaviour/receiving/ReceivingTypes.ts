import { Processor } from '@ephox/boulder';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface ReceivingBehaviour extends Behaviour.AlloyBehaviour<ReceivingConfigSpec, ReceivingConfig> {
  config: (config: ReceivingConfigSpec) => Behaviour.NamedConfiguredBehaviour<ReceivingConfigSpec, ReceivingConfig>;
}

export interface ReceivingChannelSpec {
  schema?: Processor;
  onReceive: (comp: AlloyComponent, message: any) => void;
}

export interface ReceivingChannel {
  schema: Processor;
  onReceive: (comp: AlloyComponent, message: any) => void;
}

export interface ReceivingConfig extends Behaviour.BehaviourConfigDetail {
  channels: {
    [ key: string ]: ReceivingChannel;
  };
}

export interface ReceivingConfigSpec extends Behaviour.BehaviourConfigSpec {
  channels: {
    [ key: string]: ReceivingChannelSpec;
  };
}
