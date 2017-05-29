define(
  'ephox.alloy.menu.build.SeparatorType',

  [
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema'
  ],

  function (AlloyEvents, SystemEvents, Fields, FieldSchema) {
    var builder = function (detail) {
      return {
        dom: detail.dom(),
        components: detail.components(),
        events: AlloyEvents.derive([
          AlloyEvents.stopper(SystemEvents.focusItem())
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