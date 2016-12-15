define(
  'ephox.alloy.api.ui.SplitToolbar',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.parts.PartType',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (CompositeBuilder, Toolbar, PartType, Merger, Fun) {
    var schema = [ ];

    var partTypes = [
      PartType.internal(Toolbar, 'primary', '<alloy.split-toolbar.primary>', Fun.constant({ }), Fun.constant({ })),
      PartType.internal(Toolbar, 'overflow', '<alloy.split-toolbar.overflow>', Fun.constant({ }), function (detail) {
        return {
          behaviours: {
            sliding: {
              dimension: {
                property: 'height'
              },
              closedStyle: 'a',
              openStyle: 'a',
              shrinkingStyle: 'a',
              growingStyle: 'a'
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