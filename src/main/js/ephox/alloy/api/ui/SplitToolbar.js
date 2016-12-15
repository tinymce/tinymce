define(
  'ephox.alloy.api.ui.SplitToolbar',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Css'
  ],

  function (BehaviourExport, CompositeBuilder, Toolbar, Fields, PartType, FieldSchema, Merger, Fun, Cell, Css) {
    var schema = [
      Fields.markers([ 'closedStyle', 'openStyle', 'shrinkingStyle', 'growingStyle' ]),
      FieldSchema.state('storedGroups', function () {
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
              closedStyle: detail.markers().closedStyle(),
              openStyle: detail.markers().openStyle(),
              shrinkingStyle: detail.markers().shrinkingStyle(),
              growingStyle: detail.markers().growingStyle()
            }
          }
        };
      })

    ];

    var refresh = function (toolbar, detail) {
      var primary = toolbar.getSystem().getByUid(detail.partUids().primary).getOrDie();
      var overflow = toolbar.getSystem().getByUid(detail.partUids().overflow).getOrDie();

      // Set the primary toolbar to have visibilty hidden;
      Toolbar.setGroups(primary, detail.storedGroups().get());
    };


    var make = function (detail, components, spec, externals) {
      var doSetGroups = function (toolbar, groups) {
        detail.storedGroups().set(groups);
      };

      var setGroups = function (toolbar, groups) {
        doSetGroups(toolbar, groups);
        refresh(toolbar, detail);
      };

      var createGroups = function (toolbar, gspecs) {
        var primary = toolbar.getSystem().getByUid(detail.partUids().primary).getOrDie();
        return Toolbar.createGroups(primary, gspecs);
      };

    
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
          components: components,
          apis: {
            setGroups: setGroups,
            createGroups: createGroups,
            refresh: refresh
          }
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
      parts: Fun.constant(parts),

      createGroups: function (split, gspecs) {
        var spi = split.config(BehaviourExport.spi());
        return spi.createGroups(split, gspecs);
      },

      setGroups: function (split, groups) {
        var spi = split.config(BehaviourExport.spi());
        spi.setGroups(split, groups);
      }
    };
  }
);