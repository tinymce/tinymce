define(
  'ephox.alloy.menu.build.SeparatorType',

  [
    'ephox.alloy.api.SystemEvents',
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
        uiType: 'custom',
        dom: detail.dom(),
        components: detail.components(),
        events: Objects.wrapAll([
          {
            key: SystemEvents.focusItem(),
            value: EventHandler.nu(function (component, simulatedEvent) {
              simulatedEvent.stop();
            })
          }

        ])
      };
    };

    return schema;
  }
);