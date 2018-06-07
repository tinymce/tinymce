import * as AlloyEvents from '../../api/events/AlloyEvents';
import { StreamingConfig } from 'ephox/alloy/behaviour/streaming/StreamingTypes';
import { EventFormat } from '../../events/SimulatedEvent';

const events = function (streamConfig: StreamingConfig): AlloyEvents.EventHandlerConfigRecord {
  const streams = streamConfig.stream().streams();
  const processor = streams.setup(streamConfig);
  return AlloyEvents.derive([
    AlloyEvents.run(streamConfig.event(), processor)
  ]);
};

export {
  events
};