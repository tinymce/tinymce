import * as Behaviour from './Behaviour';
import * as NoState from '../../behaviour/common/NoState';
import * as ActiveStreaming from '../../behaviour/streaming/ActiveStreaming';
import StreamingSchema from '../../behaviour/streaming/StreamingSchema';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SimulatedEvent } from '../../events/SimulatedEvent';
import { StreamingBehaviour } from '../../behaviour/streaming/StreamingTypes';

const Streaming = Behaviour.create({
  fields: StreamingSchema,
  name: 'streaming',
  active: ActiveStreaming,
  state: NoState
}) as StreamingBehaviour;

export {
  Streaming
};