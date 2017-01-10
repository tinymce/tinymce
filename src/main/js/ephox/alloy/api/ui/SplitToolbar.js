define(
  'ephox.alloy.api.ui.SplitToolbar',

  [
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.api.ui.UiBuilder',
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

  function (GuiFactory, Behaviour, Replacing, Sliding, Button, GuiTypes, Toolbar, UiBuilder, Fields, PartType, Overflows, FieldSchema, Arr, Merger, Fun, Cell, Css, Width) {
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

    var setStoredGroups = function (bar, storedGroups) {
      var bGroups = Arr.map(storedGroups, function (g) { return GuiFactory.premade(g); });
      Toolbar.setGroups(bar, bGroups);
    };

    var refresh = function (toolbar, detail) {
      var primary = toolbar.getSystem().getByUid(detail.partUids().primary).getOrDie();
      var overflow = toolbar.getSystem().getByUid(detail.partUids().overflow).getOrDie();

      // Set the primary toolbar to have visibilty hidden;
      Css.set(primary.element(), 'visibility', 'hidden');

      // Clear the overflow toolbar
      Toolbar.setGroups(overflow, [ ]);

      // Put all the groups inside the primary toolbar
      var groups = detail.builtGroups().get();

      var overflowGroupSpec = Toolbar.createGroups(primary, [
        {
          items: [
            Button.build(
              Merger.deepMerge(
                detail.parts()['overflow-button'](),
                {
                  action: function (button) {
                    button.getSystem().getByUid(detail.partUids().overflow).each(function (overflow) {
                      Sliding.toggleGrow(overflow);
                    });
                  }
                }
              )
            )
          ]
        }
      ])[0];
      console.log('overflowGroupSpec', overflowGroupSpec);
      var overflowGroup = toolbar.getSystem().build(overflowGroupSpec);

      setStoredGroups(primary, groups.concat([ overflowGroup ]));

   
      var total = Width.get(primary.element());
      console.log('total', total);

      var overflows = Overflows.partition(total, groups, function (comp) {
        return Width.get(comp.element());
      }, overflowGroup);

      if (overflows.extra().length === 0) {
        // Not ideal. Breaking abstraction somewhat, though remove is better than insert
        // Can just reset the toolbar groups also ... but may be a bit slower.
        Replacing.remove(primary, overflowGroup);
        Toolbar.setGroups(overflow, [ ]);
        // Maybe remove the overflow drawer.
      } else {
        setStoredGroups(primary, overflows.within());
        setStoredGroups(overflow, overflows.extra());
        // Maybe add the overflow drawer.
      }

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
          uid: detail.uid(),
          dom: detail.dom(),
          components: components,
          apis: {
            setGroups: setGroups,
            createGroups: createGroups,
            refresh: function (toolbar) {
              refresh(toolbar, detail);
            }
          }
        }
      );
    };

    var build = function (spec) {
      return UiBuilder.composite('split-toolbar', schema, partTypes, make, spec);
    };

    var parts = PartType.generate('split-toolbar', partTypes);

    return Merger.deepMerge(
      {
        build: build,
        parts: Fun.constant(parts)
      },

      GuiTypes.makeApis([ 'createGroups', 'setGroups', 'refresh' ])
    );
  }
);