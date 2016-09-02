define(
  'ephox.alloy.behaviour.Changing',

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
      'changing',
      'changing',
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.field('rate', 'rate', FieldPresence.strict(), ValueSchema.choose(
          'mode',
          {
            'throttle': [
              FieldSchema.strict('delay'),
              FieldSchema.state('setupLimiter', function () {
                return function (changeInfo) {
                  return Throttler(changeInfo.onChange(), changeInfo.rate().delay());
                };
              })
            ]
          }
        )),
        FieldSchema.defaulted('event', 'input'),
        FieldSchema.strict('onChange')
      ])
    );

    var exhibit = function (info, base) {
      return DomModification.nu({});
    };

    var handlers = function (info) {
      return info.changing().fold(function () {
        return { };
      }, function (changeInfo) {
        var limiter = changeInfo.rate().setupLimiter();
        var throttler = limiter(changeInfo);
        console.log("throttler", throttler);
        return Objects.wrap(
          changeInfo.event(),
          EventHandler.nu({
            run: function (component, simulatedEvent) {
              throttler.throttle(component, simulatedEvent);
              simulatedEvent.stop();
            }
          })
        );
      });
    };

    return Behaviour.contract({
      name: Fun.constant('changing'),
      exhibit: exhibit,
      handlers: handlers,
      apis: Fun.constant({ }),
      schema: Fun.constant(schema)
    });
  }
);