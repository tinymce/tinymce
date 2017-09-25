define(
  'ephox.alloy.api.ui.Tabbar',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.ui.schema.TabbarSchema',
    'ephox.katamari.api.Merger',
    'ephox.sugar.api.properties.Attr'
  ],

  function (Behaviour, Highlighting, Keying, Sketcher, TabbarSchema, Merger, Attr) {
    var factory = function (detail, components, spec, externals) {
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
            itemClass: detail.markers().tabClass(),

            // https://www.w3.org/TR/2010/WD-wai-aria-practices-20100916/#tabpanel
            // Consider a more seam-less way of combining highlighting and toggling
            onHighlight: function (tabbar, tab) {
              // TODO: Integrate highlighting and toggling in a nice way
              Attr.set(tab.element(), 'aria-selected', 'true');
            },
            onDehighlight: function (tabbar, tab) {
              Attr.set(tab.element(), 'aria-selected', 'false');
            }
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

    return Sketcher.composite({
      name: 'Tabbar',
      configFields: TabbarSchema.schema(),
      partFields: TabbarSchema.parts(),
      factory: factory
    });
  }
);