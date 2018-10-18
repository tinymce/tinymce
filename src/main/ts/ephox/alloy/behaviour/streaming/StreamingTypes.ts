import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { EventFormat, SimulatedEvent } from '../../events/SimulatedEvent';
import { BehaviourState } from '../common/BehaviourState';
import { Option } from '@ephox/katamari';

export interface StreamingBehaviour extends Behaviour.AlloyBehaviour<StreamingConfigSpec, StreamingConfig> {
  config: (config: StreamingConfigSpec) => Behaviour.NamedConfiguredBehaviour<StreamingConfigSpec, StreamingConfig>;
}

export interface ThrottleStreamingConfig extends StreamingModeConfig {
  delay: number;
  stopEvent: boolean;
}

export interface StreamingModeConfig {
  streams: {
    setup: (config: StreamingConfig, state: StreamingState) => (comp: AlloyComponent, evt: SimulatedEvent<EventFormat>) => void;
    state: (config: StreamingConfig) => StreamingState;
  };
}

export interface StreamingConfig extends Behaviour.BehaviourConfigDetail {
  event: string;
  cancelEvent: Option<string>;
  stream: StreamingModeConfig;
  onStream: (component: AlloyComponent, simulatedEvent: SimulatedEvent<EventFormat>) => void;
}

export interface CancellableStreamer {
  cancel: () => void;
}

export interface StreamingState extends BehaviourState {
  setTimer: (timer: CancellableStreamer) => void;
  cancel: () => void;
}

export interface StreamingConfigSpec extends Behaviour.BehaviourConfigSpec {
  stream: {
    mode: StreamMode;
    delay: number;
    stopEvent?: boolean;
  };
  event?: string;
  cancelEvent?: string;
  onStream: (component: AlloyComponent, simulatedEvent: SimulatedEvent<EventFormat>) => void;
}

export type StreamMode = 'throttle';