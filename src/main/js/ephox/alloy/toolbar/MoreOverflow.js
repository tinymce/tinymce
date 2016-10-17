define(
  'ephox.alloy.toolbar.MoreOverflow',

  [
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Width'
  ],

  function (DomModification, FieldSchema, Arr, Fun, Cell, Css, Insert, InsertAll, Remove, Width) {
    var schema = [
      FieldSchema.strict('initWidth'),
      FieldSchema.strict('overflows'),
      FieldSchema.state('handler', function () {
        var schema = [ ];

        var groups = Cell([ ]);

        var doExhibit = function (oInfo, base) {
          return DomModification.nu({ });
        };

        var builder = function (oInfo, gs) {
          return [
            {
              uiType: 'container',
              components: gs.concat([
                // {
                //   uiType: 'button',
                //   text: 'Open/Close',
                //   action: function (component) {
                //     var slider = component.getSystem().getByUid('more-drawer-slider').getOrDie();
                //     if (slider.apis().hasGrown()) slider.apis().shrink();
                //     else slider.apis().grow();
                //   }
                // }
              ]),
              dom: {
                styles: {
                  display: 'flex'
                }
              }
            },
            {
              uiType: 'container',
              uid: 'more-drawer-slider',
              components: [
                {
                  uiType: 'container',
                  dom: {
                    styles: {
                      height: '100px',
                      display: 'block',

                      'background-color': 'black'
                    }
                  }
                }
              ],
              replacing: { },
              sliding: {
                mode: 'height',
                // FIX: hard-coded demo styles
                closedStyle: 'demo-sliding-closed',
                openStyle: 'demo-sliding-open',
                shrinkingStyle: 'demo-sliding-height-shrinking',
                growingStyle: 'demo-sliding-height-growing'
              }
            }
          ];
        };

        var doRefresh = function (component, oInfo) {
          // NOTE: Assumes syncComponents has been called.
          var components = component.components();
          var toolbar = components[0];
          var more = components[1];

          Css.set(toolbar.element(), 'visibility', 'hidden');

          // Clear any restricted width on the toolbar somehow ----- */
          // barType.clearWidth()

          Remove.empty(toolbar.element());
          InsertAll.append(toolbar.element(), Arr.map(groups.get(), function (g) { return g.element(); }));

          var total = Width.get(toolbar.element());

          // NOTE: We need to add the overflow button because it has no width otherwise
          // Note, adding it doesn't affect the width of the toolbar, so it should be fine.
          var overflows = oInfo.overflows();
          // Insert.append(toolbar, overflows);

          // Clear out the toolbar and the more drawers
          more.apis().replace(groups.get());
          more.syncComponents();

          Remove.empty(toolbar.element());

          // Add the within to the toolbar, and the extra to the more drawer

          // barType.updateWidth

          Css.remove(component.element(), 'visibility');
          // Add the overflow group
        };

        var toApis = function (oInfo) {
          return {
            refresh: function (comp) {
              doRefresh(comp, oInfo);
            }
          };
            
        // var groups = getGroups();
        // var components = barType.build(groups);

        // // Remove all components from the toolbar
        // Css.set(toolbar, 'visibility', 'hidden');
        // // Clear any previous width setting so that it calculates the non-restricted width of the toolbar
        // barType.clearWidth();

        // Remove.empty(toolbar);
        // InsertAll.append(toolbar, components);

        // var total = barType.width(toolbar);

        // // NOTE: We need to add the overflow button because it has no width otherwise
        // // Note, adding it doesn't affect the width of the toolbar, so it should be fine.
        // Insert.append(toolbar, overflow.group());

        // var divide = Overflow.partition(total, components, Width.getOuter, overflow.group());
        // var extra = divide.extra();
        // var within = divide.within();

        // Remove.empty(toolbar);
        // Remove.empty(mores);

        // InsertAll.append(toolbar, within);
        // InsertAll.append(mores, extra);

        // barType.updateWidth(overflow, divide);
        // Css.remove(toolbar, 'visibility');
        };

        var postprocess = function (oInfo, components) {
          debugger;
          groups.set(components[0].components());
        };

        return {
          doExhibit: doExhibit,
          toApis: toApis,
          builder: builder,
          schema: Fun.constant(schema),
          postprocess: postprocess
        };
      })

    ];



    return schema;
  }
);