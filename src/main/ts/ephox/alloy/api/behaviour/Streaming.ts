import * as Behaviour from './Behaviour';
import * as NoState from '../../behaviour/common/NoState';
import * as ActiveStreaming from '../../behaviour/streaming/ActiveStreaming';
import StreamingSchema from '../../behaviour/streaming/StreamingSchema';
import { AlloyBehaviour, AlloyBehaviourConfig } from 'ephox/alloy/alien/TypeDefinitions';

export interface StreamingBehaviour extends AlloyBehaviour {
  config: (StreamingConfig) => any;
}

export interface StreamingConfig extends AlloyBehaviourConfig {
  stream: {
    mode: StreamMode,
    delay: number
  };
}

export type StreamMode = 'throttle';

const Streaming: StreamingBehaviour = Behaviour.create({
  fields: StreamingSchema,
  name: 'streaming',
  active: ActiveStreaming,
  state: NoState
});

export {
  Streaming
};