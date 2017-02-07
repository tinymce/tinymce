define(
  'ephox.alloy.ui.schema.DropdownSchema',

  [
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (InternalSink, PartType, FieldSchema, Fun, Option) {
    var schema = [
      FieldSchema.strict('fetch'),
      FieldSchema.defaulted('onOpen', Fun.noop),
      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.strict('toggleClass'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('displayer', Fun.identity),
      FieldSchema.option('lazySink'),
      FieldSchema.defaulted('matchWidth', false),
      FieldSchema.option('role')
    ];

    var partTypes = [
      PartType.external(
        { build: Fun.identity },
        'menu', 
        function (detail) {
          return {
            onExecute: detail.onExecute()
          };
        },
        Fun.constant({ })
      ),
      InternalSink
    ];

    return {
      name: Fun.constant('Dropdown'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);