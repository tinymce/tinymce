define(
  'ephox.alloy.menu.build.SeparatorType',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects'
  ],

  function (SystemEvents, EventHandler, Fields, FieldSchema, Objects) {
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

    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('components'),
      Fields.output('builder', builder)
    ];

    return schema;
  }
);