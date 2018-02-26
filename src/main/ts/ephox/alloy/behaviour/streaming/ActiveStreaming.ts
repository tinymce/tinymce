import * as AlloyEvents from '../../api/events/AlloyEvents';

const events = function (streamConfig) {
  const streams = streamConfig.stream().streams();
  const processor = streams.setup(streamConfig);
  return AlloyEvents.derive([
    AlloyEvents.run(streamConfig.event(), processor)
  ]);
};

export {
  events
};