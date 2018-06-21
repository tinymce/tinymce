import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { Processor } from '@ephox/boulder';
import { BehaviourConfigSpec, BehaviourConfigDetail } from '../../api/behaviour/Behaviour';


export interface ReceivingBehaviour extends Behaviour.AlloyBehaviour<ReceivingConfigSpec, ReceivingConfig> {
  config: (config: ReceivingConfigSpec) => Behaviour.NamedConfiguredBehaviour<ReceivingConfigSpec, ReceivingConfig>;
}

export interface ReceivingConfig extends BehaviourConfigDetail {
  channels: () => {
    [ key: string ]: () => {
      schema: () => Processor;
      onReceive: () => (comp: AlloyComponent, any) => void;
    }
  }
}

export interface ReceivingConfigSpec extends BehaviourConfigSpec {
  channels: {
    [ key: string] : {
      onReceive: any;
      schema?: Processor;
    }
  }
}