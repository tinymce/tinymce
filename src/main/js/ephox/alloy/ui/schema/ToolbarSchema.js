define(
  'ephox.alloy.ui.schema.ToolbarSchema',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Behaviour, Replacing, Fields, PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.defaulted('shell', true),
      FieldSchema.defaulted('toolbarBehaviours', { })
    ];

    // TODO: Dupe with Toolbar
    var enhanceGroups = function (detail) {
      return {
        behaviours: Behaviour.derive([
          Replacing.config({ })
        ])
      };
    };

    var partTypes = [
      // Note, is the container for putting all the groups in, not a group itself.
      PartType.optional({
        name: 'groups',
        overrides: enhanceGroups
      })
    ];

    return {
      name: Fun.constant('Toolbar'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);