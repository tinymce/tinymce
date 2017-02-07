define(
  'ephox.alloy.ui.schema.SplitToolbarSchema',

  [
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell'
  ],

  function (Toolbar, Fields, PartType, FieldSchema, Fun, Cell) {
    var schema = [
      Fields.markers([ 'closedClass', 'openClass', 'shrinkingClass', 'growingClass' ]),
      FieldSchema.state('builtGroups', function () {
        return Cell([ ]);
      })
    ];

    var partTypes = [
      PartType.internal(Toolbar, 'primary', '<alloy.split-toolbar.primary>', Fun.constant({ }), Fun.constant({ })),
      PartType.internal(Toolbar, 'overflow', '<alloy.split-toolbar.overflow>', Fun.constant({ }), function (detail) {
        return {
          behaviours: {
            sliding: {
              dimension: {
                property: 'height'
              },
              closedClass: detail.markers().closedClass(),
              openClass: detail.markers().openClass(),
              shrinkingClass: detail.markers().shrinkingClass(),
              growingClass: detail.markers().growingClass()
            }
          }
        };
      }),
      PartType.external({ built: Fun.identity }, 'overflow-button', Fun.constant({ }), Fun.constant({ }))
    ];

    return {
      name: Fun.constant('SplitToolbar'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);