import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { Processor } from '@ephox/boulder';


export interface ReceivingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: ReceivingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
}

export interface ReceivingConfig {
  channels: () => {
    [ key: string ]: () => {
      schema: () => Processor;
      onReceive: () => (AlloyComponent, any) => void;
    }
  }
}

export interface ReceivingConfigSpec {
  channels: {
    [ key: string] : {
      onReceive: any;
      schema?: Processor;
    }
  }
}