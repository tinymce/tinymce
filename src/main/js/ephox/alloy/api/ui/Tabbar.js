define(
  'ephox.alloy.api.ui.Tabbar',

  [
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.TabbarSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Highlighting, UiSketcher, PartType, TabbarSchema, Fun) {
    var schema = TabbarSchema.schema();
    var partTypes = TabbarSchema.parts();

    var make = function (detail, components, spec, externals) {
      return {
        uid: detail.uid(),
        dom: {
          tag: 'div',
          attributes: {
            role: 'tablist'
          }
        },
        components: components,
        'debug.sketcher': 'Tabbar',

        behaviours: {
          highlighting: {
            highlightClass: detail.markers().selectedClass(),
            itemClass: detail.markers().tabClass()
          },

          keying: {
            mode: 'flow',
            getInitial: function (tabbar) {
              // Restore focus to the previously highlighted tab.
              return Highlighting.getHighlighted(tabbar).map(function (tab) {
                return tab.element();
              });
            },
            selector: '.' + detail.markers().tabClass(),
            executeOnMove: true
          }
        }
      };
    };


    var sketch = function (spec) {
      return UiSketcher.composite(TabbarSchema.name(), schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate(TabbarSchema.name(), partTypes);

    return {
      sketch: sketch,
      parts: Fun.constant(parts)


    };
  }
);