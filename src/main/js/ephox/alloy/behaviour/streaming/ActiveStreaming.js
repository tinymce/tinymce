define(
  'ephox.alloy.behaviour.streaming.ActiveStreaming',

  [
    'ephox.alloy.api.events.AlloyEvents'
  ],

  function (AlloyEvents) {
    var events = function (streamConfig) {
      var streams = streamConfig.stream().streams();
      var processor = streams.setup(streamConfig);
      return AlloyEvents.derive([
        AlloyEvents.run(streamConfig.event(), processor)
      ]);
    };

    return {
      events: events
    };
  }
);