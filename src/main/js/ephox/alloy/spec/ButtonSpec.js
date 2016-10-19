define(
  'ephox.alloy.spec.ButtonSpec',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (SystemEvents, EventHandler, FieldSchema, Objects, ValueSchema, Merger, Fun) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('action'),
      FieldSchema.option('uid')
    ]);


    var make = function (spec) {
      // Not sure about where these getOrDie statements are
      var detail = ValueSchema.asStructOrDie('button.spec', schema, spec);

      var executeHandler = EventHandler.nu({
        run: function (component, simulatedEvent) {
          var action = detail.action();
          action(component);
          simulatedEvent.stop();
        }
      });

      var clickHandler = EventHandler.nu({
        run: function (component, simulatedEvent) {
          var system = component.getSystem();
          simulatedEvent.stop();
          system.triggerEvent(SystemEvents.execute(), component.element(), { });
        }
      });

      var events = Objects.wrapAll([
        { key: SystemEvents.execute(), value: executeHandler },
        { key: 'click', value: clickHandler }
      ]);

      return Merger.deepMerge(
        {
          events: events
        },

        {
          tabstopping: true,
          focusing: true,
          keying: {
            mode: 'execution',
            useSpace: true,
            useEnter: true
          }
        },

        {
          dom: {
            attributes: {
              role: 'button'
            }
          }
        },

        spec, 

        {
          uiType: 'custom'
        },

        detail.uid().fold(Fun.constant({ }), function (uid) {
          return Objects.wrap('uid', uid);
        })
      );
    };

    return {
      make: make
    };
  }
);