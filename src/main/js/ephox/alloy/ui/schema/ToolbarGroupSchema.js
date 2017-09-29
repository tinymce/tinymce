define(
  'ephox.alloy.ui.schema.ToolbarGroupSchema',

  [
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Keying, SketchBehaviours, Fields, PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('items'),
      Fields.markers([ 'itemClass' ]),
      SketchBehaviours.field('tgroupBehaviours', [ Keying ])
    ];

    var partTypes = [
      PartType.group({
        name: 'items',
        unit: 'item',
        overrides: function (detail) {
          return {
            domModification: {
              classes: [ detail.markers().itemClass() ]
            }
          };
        }
      })
    ];

    return {
      name: Fun.constant('ToolbarGroup'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);