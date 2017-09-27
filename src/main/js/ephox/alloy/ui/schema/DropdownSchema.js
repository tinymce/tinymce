define(
  'ephox.alloy.ui.schema.DropdownSchema',

  [
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Coupling, Focusing, Keying, Toggling, SketchBehaviours, Fields, InternalSink, PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('fetch'),
      Fields.onHandler('onOpen'),
      Fields.onKeyboardHandler('onExecute'),
      SketchBehaviours.field('dropdownBehaviours', [ Toggling, Coupling, Keying, Focusing ]),
      FieldSchema.strict('toggleClass'),
      FieldSchema.defaulted('displayer', Fun.identity),
      FieldSchema.option('lazySink'),
      FieldSchema.defaulted('matchWidth', false),
      FieldSchema.option('role')
    ];

    var partTypes = [
      PartType.external({
        schema: [
          Fields.tieredMenuMarkers()
        ],
        name: 'menu',
        defaults: function (detail) {
          return {
            onExecute: detail.onExecute()
          };
        }
      }),

      InternalSink.partType()
    ];

    return {
      name: Fun.constant('Dropdown'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);