define(
  'ephox.alloy.ui.composite.TabbarSpec',

  [
    'ephox.alloy.api.behaviour.Highlighting'
  ],

  function (Highlighting) {
    var make = function (detail, components, spec, externals) {
      return {
        uiType: 'custom',
        dom: {
          tag: 'div',
          attributes: {
            role: 'tablist'
          }
        },
        components: components,

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

    return {
      make: make
    };
  }
);