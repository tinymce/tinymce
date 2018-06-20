import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { SimulatedEvent, EventFormat } from '../../events/SimulatedEvent';
import { BehaviourConfigSpec, BehaviourConfigDetail } from '../../api/behaviour/Behaviour';


export interface StreamingBehaviour extends Behaviour.AlloyBehaviour<StreamingConfigSpec, StreamingConfig> {
  config: (config: StreamingConfigSpec) => Behaviour.NamedConfiguredBehaviour<StreamingConfigSpec, StreamingConfig>;
}

export interface StreamingConfig extends BehaviourConfigDetail {
  event: () => string;
  stream: () => {
    streams: () => {
      setup: (StreamingConfig) => (AlloyComponent, SimulatedEvent) => void;
    }
  }
};

export interface StreamingConfigSpec extends BehaviourConfigSpec {
  stream: {
    mode: StreamMode,
    delay: number
  };
  event?: string;
  onStream: (component: AlloyComponent, simulatedEvent: SimulatedEvent<EventFormat>) => void;
}

export type StreamMode = 'throttle';