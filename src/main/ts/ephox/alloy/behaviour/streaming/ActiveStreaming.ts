import AlloyEvents from '../../api/events/AlloyEvents';

var events = function (streamConfig) {
  var streams = streamConfig.stream().streams();
  var processor = streams.setup(streamConfig);
  return AlloyEvents.derive([
    AlloyEvents.run(streamConfig.event(), processor)
  ]);
};

export default <any> {
  events: events
};