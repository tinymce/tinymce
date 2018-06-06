import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Option } from '@ephox/katamari';


export interface StreamingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: StreamingConfig) => Behaviour.NamedConfiguredBehaviour;
}

export interface StreamingConfig {
  stream: {
    mode: StreamMode,
    delay: number
  };
  event?: any;
  onStream: (component: AlloyComponent, simulatedEvent: SimulatedEvent) => void;
}

export type StreamMode = 'throttle';