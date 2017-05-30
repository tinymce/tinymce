define(
  'ephox.alloy.api.ui.SplitToolbar',

  [
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.alloy.parts.AlloyParts',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.toolbar.Overflows',
    'ephox.alloy.ui.schema.SplitToolbarSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Width'
  ],

  function (Replacing, Sliding, GuiFactory, Button, Sketcher, Toolbar, ToolbarGroup, AlloyParts, PartType, Overflows, SplitToolbarSchema, Arr, Merger, Css, Width) {
    var setStoredGroups = function (bar, storedGroups) {
      var bGroups = Arr.map(storedGroups, function (g) { return GuiFactory.premade(g); });
      Toolbar.setGroups(bar, bGroups);
    };

    var refresh = function (toolbar, detail, externals) {
      var ps = AlloyParts.getPartsOrDie(toolbar, detail, [ 'primary', 'overflow' ]);
      var primary = ps.primary();
      var overflow = ps.overflow();

      // Set the primary toolbar to have visibilty hidden;
      Css.set(primary.element(), 'visibility', 'hidden');

      // Clear the overflow toolbar
      Toolbar.setGroups(overflow, [ ]);

      // Put all the groups inside the primary toolbar
      var groups = detail.builtGroups().get();

      var overflowGroupSpec = ToolbarGroup.sketch(
        Merger.deepMerge(
          externals['overflow-group'](),
          {
            items: [
              Button.sketch(
                Merger.deepMerge(
                  externals['overflow-button'](),
                  {
                    action: function (button) {
                      // This used to look up the overflow again ... we may need to do that.
                      Sliding.toggleGrow(ps.overflow());
                    }
                  }
                )
              )
            ]
          }
        )
      );
      var overflowGroup = toolbar.getSystem().build(overflowGroupSpec);

      setStoredGroups(primary, groups.concat([ overflowGroup ]));


      var total = Width.get(primary.element());

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


    var factory = function (detail, components, spec, externals) {
      var doSetGroups = function (toolbar, groups) {
        var built = Arr.map(groups, toolbar.getSystem().build);
        detail.builtGroups().set(built);
      };

      var setGroups = function (toolbar, groups) {
        doSetGroups(toolbar, groups);
        refresh(toolbar, detail, externals);
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
            refresh: function (toolbar) {
              refresh(toolbar, detail, externals);
            }
          }
        }
      );
    };

    return Sketcher.composite({
      name: 'SplitToolbar',
      configFields: SplitToolbarSchema.schema(),
      partFields: SplitToolbarSchema.parts(),
      factory: factory,
      apis: {
        setGroups: function (apis, toolbar, groups) {
          apis.setGroups(toolbar, groups);
        },
        refresh: function (apis, toolbar) {
          apis.refresh(toolbar);
        }
      }
    });
  }
);