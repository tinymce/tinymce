define(
  'ephox.alloy.behaviour.streaming.ActiveStreaming',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects'
  ],

  function (EventHandler, Objects) {
    var events = function (streamConfig) {
      var streams = streamConfig.stream().streams();
      var processor = streams.setup(streamConfig);
      return Objects.wrap(
        streamConfig.event(),
        EventHandler.nu({
          run: function (component, simulatedEvent) {
            processor(component, simulatedEvent);
          }
        })
      );
    };

    return {
      events: events
    };
  }
);