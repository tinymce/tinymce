define(
  'ephox.alloy.api.ui.ToolbarGroup',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'global!Error'
  ],

  function (CompositeBuilder, Fields, PartType, FieldSchema, Merger, Fun, Error) {
    var schema = [
      FieldSchema.strict('items'),
      Fields.members([ 'item' ])
    ];

    var partTypes = [
      PartType.group({ build: Fun.identity }, 'items', 'item', '<alloy.toolbar-group.items>', Fun.constant({ }), Fun.constant({ }))
    ];

    var make = function (detail, components, spec, _externals) {
      return Merger.deepMerge(
        {
          dom: {
            attributes: {
              role: 'toolbar'
            }
          }
        },
        {
          uiType: 'custom',
          uid: detail.uid(),
          dom: detail.dom(),
          components: components
        }
      );
    };

    var build = function (spec) {
      return CompositeBuilder.build('toolbar-group', schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate('toolbar-group', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);