define(
  'ephox.alloy.behaviour.streaming.StreamingSchema',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Throttler'
  ],

  function (FieldPresence, FieldSchema, ValueSchema, Throttler) {
    return [
      // TODO: Use improved boulder.
      FieldSchema.field('stream', 'stream', FieldPresence.strict(), ValueSchema.choose(
        'mode',
        {
          'throttle': [
            FieldSchema.strict('delay'),
            FieldSchema.defaulted('stopEvent', true),
            FieldSchema.state('streams', function () {
              var setup = function (streamInfo) {
                var sInfo = streamInfo.stream();
                var throttler = Throttler(streamInfo.onStream(), sInfo.delay());

                return function (component, simulatedEvent) {
                  throttler.throttle(component, simulatedEvent);
                  if (sInfo.stopEvent()) simulatedEvent.stop();
                };
              };

              return {
                setup: setup
              };
            })
          ]
        }
      )),
      FieldSchema.defaulted('event', 'input'),
      FieldSchema.strict('onStream')
    ];
  }
);