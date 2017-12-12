import Behaviour from './Behaviour';
import NoState from '../../behaviour/common/NoState';
import ActiveStreaming from '../../behaviour/streaming/ActiveStreaming';
import StreamingSchema from '../../behaviour/streaming/StreamingSchema';



export default <any> Behaviour.create({
  fields: StreamingSchema,
  name: 'streaming',
  active: ActiveStreaming,
  state: NoState
});