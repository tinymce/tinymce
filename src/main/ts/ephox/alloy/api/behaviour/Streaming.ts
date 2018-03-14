import * as Behaviour from './Behaviour';
import * as NoState from '../../behaviour/common/NoState';
import * as ActiveStreaming from '../../behaviour/streaming/ActiveStreaming';
import StreamingSchema from '../../behaviour/streaming/StreamingSchema';

export interface StreamingBehaviour extends Behaviour.AlloyBehaviour {
  config: (StreamingConfig) => { key: string, value: any };
}

export interface StreamingConfig extends Behaviour.AlloyBehaviourConfig {
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