define(
  'ephox.alloy.spec.ButtonSpec',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (SystemEvents, EventHandler, SpecSchema, FieldSchema, Objects, Arr, Merger, Fun) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.option('action'),
      FieldSchema.option('role')
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
          system.triggerEvent(SystemEvents.execute(), component.element(), {
            button: Fun.constant(component)
          });
        }
      });

      // Other mouse down listeners above this one should not get mousedown behaviour (like dragging)
      var mousedownHandler = EventHandler.nu({
        run: function (component, simulatedEvent) {
          simulatedEvent.cut();
        }
      });

      var events = Objects.wrapAll(
        Arr.flatten([
          detail.action.isSome() ? [ { key: SystemEvents.execute(), value: executeHandler } ] : [ ],
          [ { key: 'click', value: clickHandler } ],
          [ { key: 'mousedown', value: mousedownHandler } ]
        ])
      );

      return Merger.deepMerge(
        {
          events: events
        },

        {
          behaviours: {
            focusing: true,
            keying: {
              mode: 'execution',
              useSpace: true,
              useEnter: true
            }
          }
        },

        {
          dom: {
            attributes: {
              type: 'button',
              role: detail.role.getOr('button')
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