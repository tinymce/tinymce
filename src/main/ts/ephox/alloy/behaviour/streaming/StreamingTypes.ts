import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { SimulatedEvent, EventFormat } from '../../events/SimulatedEvent';

export interface StreamingBehaviour extends Behaviour.AlloyBehaviour<StreamingConfigSpec, StreamingConfig> {
  config: (config: StreamingConfigSpec) => Behaviour.NamedConfiguredBehaviour<StreamingConfigSpec, StreamingConfig>;
}

export interface StreamingConfig extends Behaviour.BehaviourConfigDetail {
  event: () => string;
  stream: () => {
    streams: () => {
      setup: (config: StreamingConfig) => (comp: AlloyComponent, evt: SimulatedEvent<EventFormat>) => void;
    }
  };
}

export interface StreamingConfigSpec extends Behaviour.BehaviourConfigSpec {
  stream: {
    mode: StreamMode,
    delay: number
  };
  event?: string;
  onStream: (component: AlloyComponent, simulatedEvent: SimulatedEvent<EventFormat>) => void;
}

export type StreamMode = 'throttle';