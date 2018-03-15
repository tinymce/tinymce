import * as Behaviour from './Behaviour';
import * as NoState from '../../behaviour/common/NoState';
import * as ActiveStreaming from '../../behaviour/streaming/ActiveStreaming';
import StreamingSchema from '../../behaviour/streaming/StreamingSchema';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { SimulatedEvent } from 'ephox/alloy/events/SimulatedEvent';

export interface StreamingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: StreamingConfig) => { [key: string]: (any) => any };
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

const Streaming = Behaviour.create({
  fields: StreamingSchema,
  name: 'streaming',
  active: ActiveStreaming,
  state: NoState
}) as StreamingBehaviour;

export {
  Streaming
};