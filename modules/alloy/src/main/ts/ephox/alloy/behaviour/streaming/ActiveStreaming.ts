import * as AlloyEvents from '../../api/events/AlloyEvents';
import { StreamingConfig, StreamingState } from './StreamingTypes';

const events = (streamConfig: StreamingConfig, streamState: StreamingState): AlloyEvents.AlloyEventRecord => {
  const streams = streamConfig.stream.streams;
  const processor = streams.setup(streamConfig, streamState);
  return AlloyEvents.derive([
    AlloyEvents.run(streamConfig.event, processor),
    AlloyEvents.runOnDetached(() => streamState.cancel())
  ].concat(
    streamConfig.cancelEvent.map((e) => {
      return [
        AlloyEvents.run(e, () => streamState.cancel())
      ];
    }).getOr([ ])
  ));
};

export {
  events
};
