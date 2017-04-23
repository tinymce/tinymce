define(
  'ephox.alloy.ui.schema.SplitToolbarSchema',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun'
  ],

  function (Behaviour, Sliding, Toolbar, Fields, PartType, FieldSchema, Cell, Fun) {
    var schema = [
      Fields.markers([ 'closedClass', 'openClass', 'shrinkingClass', 'growingClass' ]),
      FieldSchema.state('builtGroups', function () {
        return Cell([ ]);
      })
    ];

    var toolbarSchema = [
      FieldSchema.strict('dom'),
      FieldSchema.strictObjOf('parts', [
        // NOTE: In shell===false mode, this is a little different (for a toolbar)
        FieldSchema.strict('groups')
      ]),
      FieldSchema.strictObjOf('members', [
        FieldSchema.strictObjOf('group', [
          FieldSchema.strict('munge')
        ])
      ])
    ];

    var partTypes = [
      PartType.internal(Toolbar, toolbarSchema, 'primary', '<alloy.split-toolbar.primary>', Fun.constant({ }), Fun.constant({ })),
      PartType.internal(Toolbar, toolbarSchema, 'overflow', '<alloy.split-toolbar.overflow>', Fun.constant({ }), function (detail) {
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
      }),
      PartType.external({ built: Fun.identity }, [ ], 'overflow-button', Fun.constant({ }), Fun.constant({ }))
    ];

    return {
      name: Fun.constant('SplitToolbar'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);