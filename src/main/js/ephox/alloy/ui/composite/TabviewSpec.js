define(
  'ephox.alloy.ui.composite.TabviewSpec',

  [

  ],

  function () {
    var make = function (detail, components, spec, externals) {
      return {
        uiType: 'custom',
        dom: {
          tag: 'div',
          attributes: {
            role: 'tabpanel'
          }
        }
      };
    };

    // FIX: Generate an ID for a view that matches the tab.

    return {
      make: make
    };
  }
);