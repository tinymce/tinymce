define(
  'ephox.alloy.behaviour.streaming.ActiveStreaming',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects'
  ],

  function (EventHandler, Objects) {
    var events = function (streamInfo) {
      var streams = streamInfo.stream().streams();
      var processor = streams.setup(streamInfo);
      return Objects.wrap(
        streamInfo.event(),
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