define(
  'ephox.alloy.ui.schema.DropdownSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (Fields, InternalSink, PartType, FieldSchema, Fun, Option) {
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
        { sketch: Fun.identity },
        [
          Fields.tieredMenuMarkers(),
          Fields.members([ 'menu', 'item' ])
        ],
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