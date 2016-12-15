define(
  'ephox.alloy.api.ui.SplitToolbar',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (CompositeBuilder, Toolbar, Fields, PartType, Merger, Fun) {
    var schema = [
      Fields.markers([ 'closedStyle', 'openStyle', 'shrinkingStyle', 'growingStyle' ])
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
              closedStyle: detail.markers().closedStyle(),
              openStyle: detail.markers().openStyle(),
              shrinkingStyle: detail.markers().shrinkingStyle(),
              growingStyle: detail.markers().growingStyle()
            }
          }
        };
      })

    ];

    var make = function (detail, components, spec, externals) {
      return Merger.deepMerge(
        {
          dom: {
            attributes: {
              role: 'group'
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
      return CompositeBuilder.build('split-toolbar', schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate('split-toolbar', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)


    };
  }
);