define(
  'ephox.alloy.menu.build.SeparatorType',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects'
  ],

  function (SystemEvents, EventHandler, FieldSchema, Objects) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('components'),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ];

    var builder = function (detail) {
      return {
        dom: detail.dom(),
        components: detail.components(),
        events: Objects.wrapAll([
          {
            key: SystemEvents.focusItem(),
            value: EventHandler.nu({
              run: function (component, simulatedEvent) {
                simulatedEvent.stop();
              }
            })
          }

        ])
      };
    };

    return schema;
  }
);