define(
  'ephox.alloy.behaviour.streaming.StreamingSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Throttler'
  ],

  function (Fields, FieldSchema, ValueSchema, Throttler) {
    var setup = function (streamInfo) {
      var sInfo = streamInfo.stream();
      var throttler = Throttler.last(streamInfo.onStream(), sInfo.delay());

      return function (component, simulatedEvent) {
        throttler.throttle(component, simulatedEvent);
        if (sInfo.stopEvent()) simulatedEvent.stop();
      };
    };

    return [
      FieldSchema.strictOf('stream', ValueSchema.choose(
        'mode',
        {
          'throttle': [
            FieldSchema.strict('delay'),
            FieldSchema.defaulted('stopEvent', true),
            Fields.output('streams', {
              setup: setup
            })
          ]
        }
      )),
      FieldSchema.defaulted('event', 'input'),
      Fields.onStrictHandler('onStream')
    ];
  }
);