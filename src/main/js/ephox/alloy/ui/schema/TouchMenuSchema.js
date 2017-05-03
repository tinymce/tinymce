define(
  'ephox.alloy.ui.schema.TouchMenuSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Fields, InternalSink, PartType, FieldSchema, Fun) {
    // Similar to dropdown.
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('fetch'),
      Fields.onHandler('onOpen'),
      Fields.onKeyboardHandler('onExecute'),
      FieldSchema.defaulted('touchmenuBehaviours', { }),
      FieldSchema.strict('toggleClass'),
      FieldSchema.option('lazySink'),
      FieldSchema.option('role')
    ];

    var partTypes = [
      PartType.external(
        { sketch: Fun.identity },
        [
          Fields.itemMarkers(),
          Fields.members([ 'item' ])
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
      name: Fun.constant('TouchMenu'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);
