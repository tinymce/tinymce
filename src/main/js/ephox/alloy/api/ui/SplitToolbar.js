define(
  'ephox.alloy.api.ui.SplitToolbar',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.toolbar.Overflows',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Width'
  ],

  function (BehaviourExport, CompositeBuilder, Toolbar, Fields, PartType, Overflows, FieldSchema, Arr, Merger, Fun, Cell, Css, Width) {
    var schema = [
      Fields.markers([ 'closedStyle', 'openStyle', 'shrinkingStyle', 'growingStyle' ]),
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
              closedStyle: detail.markers().closedStyle(),
              openStyle: detail.markers().openStyle(),
              shrinkingStyle: detail.markers().shrinkingStyle(),
              growingStyle: detail.markers().growingStyle()
            }
          }
        };
      }),
      PartType.external({ built: Fun.identity }, 'overflow-button', Fun.constant({ }), Fun.constant({ }))
    ];

    var refresh = function (toolbar, detail) {
      var primary = toolbar.getSystem().getByUid(detail.partUids().primary).getOrDie();
      var overflow = toolbar.getSystem().getByUid(detail.partUids().overflow).getOrDie();

      // Set the primary toolbar to have visibilty hidden;
      Css.set(primary.element(), 'visibility', 'hidden');

      // Clear the overflow toolbar
      Toolbar.setGroups(overflow, [ ]);

      // Put all the groups inside the primary toolbar
      var groups = detail.builtGroups().get();

      var bGroups = Arr.map(groups, function (g) { return { built: g }; });

      // Use the { built } version to add to toolbar.
      Toolbar.setGroups(primary, bGroups);

      debugger;
      var overflowGroupSpec = Toolbar.createGroups(primary, [ { items: [ { text: 'More' } ] } ])[0];
      console.log('overflowGroupSpec', overflowGroupSpec);
      var overflowGroup = toolbar.getSystem().build(overflowGroupSpec);


      var total = Width.get(primary.element());
      console.log('total', total);

      var overflows = Overflows.partition(total, groups, function (comp) {
        return Width.get(comp.element());
      }, overflowGroup);

      Css.remove(primary.element(), 'visibility');
      Css.reflow(primary.element());

    };


    var make = function (detail, components, spec, externals) {
      var doSetGroups = function (toolbar, groups) {
        var built = Arr.map(groups, toolbar.getSystem().build);
        detail.builtGroups().set(built);
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