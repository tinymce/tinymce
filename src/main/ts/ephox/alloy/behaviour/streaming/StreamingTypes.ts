import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { SimulatedEvent } from 'ephox/alloy/events/SimulatedEvent';


export interface StreamingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: StreamingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
}

export interface StreamingConfig {
  event: () => string;
  stream: () => {
    streams: () => {
      setup: (StreamingConfig) => (AlloyComponent, SimulatedEvent) => void;
    }
  }
};

export interface StreamingConfigSpec {
  stream: {
    mode: StreamMode,
    delay: number
  };
  event?: any;
  onStream: (component: AlloyComponent, simulatedEvent: SimulatedEvent) => void;
}

export type StreamMode = 'throttle';