define(
  'ephox.alloy.ui.schema.DropdownSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Fields, InternalSink, PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('fetch'),
      Fields.onHandler('onOpen'),
      Fields.onKeyboardHandler('onExecute'),
      FieldSchema.defaulted('dropdownBehaviours', { }),
      FieldSchema.strict('toggleClass'),
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
      InternalSink.partType()
    ];

    return {
      name: Fun.constant('Dropdown'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);