define(
  'ephox.alloy.api.ui.Tabbar',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.TabbarSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger'
  ],

  function (Behaviour, Highlighting, Keying, UiSketcher, PartType, TabbarSchema, Fun, Merger) {
    var schema = TabbarSchema.schema();
    var partTypes = TabbarSchema.parts();

    var make = function (detail, components, spec, externals) {
      return {
        uid: detail.uid(),
        dom: Merger.deepMerge(
          {
            tag: 'div',
            attributes: {
              role: 'tablist'
            }
          },
          detail.dom()
        ),
        components: components,
        'debug.sketcher': 'Tabbar',

        behaviours: Behaviour.derive([
          Highlighting.config({
            highlightClass: detail.markers().selectedClass(),
            itemClass: detail.markers().tabClass()
          }),

          Keying.config({
            mode: 'flow',
            getInitial: function (tabbar) {
              // Restore focus to the previously highlighted tab.
              return Highlighting.getHighlighted(tabbar).map(function (tab) {
                return tab.element();
              });
            },
            selector: '.' + detail.markers().tabClass(),
            executeOnMove: true
          })
        ])
      };
    };


    var sketch = function (spec) {
      return UiSketcher.composite(TabbarSchema.name(), schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate(TabbarSchema.name(), partTypes);

    return {
      sketch: sketch,
      parts: Fun.constant(parts),
      schemas: Fun.constant(TabbarSchema)


    };
  }
);