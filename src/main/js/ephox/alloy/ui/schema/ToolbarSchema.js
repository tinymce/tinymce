define(
  'ephox.alloy.ui.schema.ToolbarSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (Fields, PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.defaulted('shell', true),
      Fields.members([ 'group' ])
    ];

    // TODO: Dupe with Toolbar
    var enhanceGroups = function (detail) {
      return {
        behaviours: {
          replacing: { }
        }
      };
    };

    var partTypes = [
      PartType.optional({ sketch: Fun.identity }, 'groups', '<alloy.toolbar.groups>', Fun.constant({ }), enhanceGroups)
    ];

    return {
      name: Fun.constant('Toolbar'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);