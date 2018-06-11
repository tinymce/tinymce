import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { SimulatedEvent, EventFormat } from '../../events/SimulatedEvent';


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
  onStream: (component: AlloyComponent, simulatedEvent: SimulatedEvent<EventFormat>) => void;
}

export type StreamMode = 'throttle';