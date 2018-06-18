import * as AlloyEvents from '../../api/events/AlloyEvents';
import { StreamingConfig } from '../../behaviour/streaming/StreamingTypes';
import { EventFormat } from '../../events/SimulatedEvent';

const events = (streamConfig: StreamingConfig): AlloyEvents.AlloyEventRecord => {
  const streams = streamConfig.stream().streams();
  const processor = streams.setup(streamConfig);
  return AlloyEvents.derive([
    AlloyEvents.run(streamConfig.event(), processor)
  ]);
};

export {
  events
};