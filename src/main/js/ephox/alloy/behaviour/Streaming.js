define(
  'ephox.alloy.behaviour.Streaming',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.peanut.Throttler'
  ],

  function (Behaviour, EventHandler, DomModification, FieldPresence, FieldSchema, Objects, ValueSchema, Fun, Throttler) {
     var schema = FieldSchema.field(
      'streaming',
      'streaming',
      FieldPresence.asOption(),
      ValueSchema.objOf([
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
      ])
    );

    var exhibit = function (info, base) {
      return DomModification.nu({});
    };

    var handlers = function (info) {
      return info.streaming().fold(function () {
        return { };
      }, function (streamInfo) {
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
      });
    };

    return Behaviour.contract({
      name: Fun.constant('streaming'),
      exhibit: exhibit,
      handlers: handlers,
      apis: Fun.constant({ }),
      schema: Fun.constant(schema)
    });
  }
);