define(
  'ephox.alloy.api.ui.Tabbar',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.ui.schema.TabbarSchema',
    'ephox.katamari.api.Merger'
  ],

  function (Behaviour, Highlighting, Keying, Sketcher, TabbarSchema, Merger) {
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

    return Sketcher.composite({
      name: 'Tabbar',
      configFields: TabbarSchema.schema(),
      partFields: TabbarSchema.parts(),
      factory: factory
    });
  }
);