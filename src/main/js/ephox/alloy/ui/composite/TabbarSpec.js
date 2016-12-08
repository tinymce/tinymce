define(
  'ephox.alloy.ui.composite.TabbarSpec',

  [

  ],

  function () {
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
            highlightClass: 'demo-selected-tab',
            itemClass: 'demo-tab'
          }
        }
      };
    };

    return {
      make: make
    };
  }
);