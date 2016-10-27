define(
  'ephox.alloy.spec.ButtonSpec',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.highway.Merger'
  ],

  function (SystemEvents, EventHandler, SpecSchema, FieldSchema, Objects, Arr, Merger) {
    var schema = [
      FieldSchema.option('action')
    ];


    var make = function (spec) {
      var detail = SpecSchema.asRawOrDie('button', schema, spec, [ ]);

      var executeHandler = EventHandler.nu({
        run: function (component, simulatedEvent) {
          detail.action.each(function (action) {
            action(component);
            simulatedEvent.stop();
          });
        }
      });

      var clickHandler = EventHandler.nu({
        run: function (component, simulatedEvent) {
          var system = component.getSystem();
          simulatedEvent.stop();
          system.triggerEvent(SystemEvents.execute(), component.element(), { });
        }
      });

      var events = Objects.wrapAll(
        Arr.flatten([
          detail.action.isSome() ? [ { key: SystemEvents.execute(), value: executeHandler } ] : [ ],
          [ { key: 'click', value: clickHandler } ]
        ])
      );

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
        }
      );
    };

    return {
      make: make
    };
  }
);