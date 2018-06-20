import * as ActiveStreaming from '../../behaviour/streaming/ActiveStreaming';
import StreamingSchema from '../../behaviour/streaming/StreamingSchema';
import { StreamingBehaviour } from '../../behaviour/streaming/StreamingTypes';
import * as Behaviour from './Behaviour';

const Streaming = Behaviour.create({
  fields: StreamingSchema,
  name: 'streaming',
  active: ActiveStreaming
}) as StreamingBehaviour;

export {
  Streaming
};