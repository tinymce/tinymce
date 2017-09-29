define(
  'ephox.alloy.ui.schema.SplitToolbarSchema',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun'
  ],

  function (Behaviour, Sliding, SketchBehaviours, Toolbar, Fields, PartType, FieldSchema, Cell, Fun) {
    var schema = [
      Fields.markers([ 'closedClass', 'openClass', 'shrinkingClass', 'growingClass' ]),
      SketchBehaviours.field('splitToolbarBehaviours', [ ]),
      FieldSchema.state('builtGroups', function () {
        return Cell([ ]);
      })
    ];

    var toolbarSchema = [
      FieldSchema.strict('dom')
    ];

    var partTypes = [
      PartType.required({
        factory: Toolbar,
        schema: toolbarSchema,
        name: 'primary'
      }),

      PartType.required({
        factory: Toolbar,
        schema: toolbarSchema,
        name: 'overflow',
        overrides: function (detail) {
          return {
            toolbarBehaviours: Behaviour.derive([
              Sliding.config({
                dimension: {
                  property: 'height'
                },
                closedClass: detail.markers().closedClass(),
                openClass: detail.markers().openClass(),
                shrinkingClass: detail.markers().shrinkingClass(),
                growingClass: detail.markers().growingClass()
              })
            ])
          };
        }
      }),

      PartType.external({
        name: 'overflow-button'
      }),

      PartType.external({
        name: 'overflow-group'
      })
    ];

    return {
      name: Fun.constant('SplitToolbar'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);