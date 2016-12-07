define(
  'ephox.alloy.api.ui.SplitDropdown',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    var components = function (f) {
      var placeholders = {
        arrow: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.split-dropdown.arrow>' }),
        button: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.split-dropdown.button>' })
      };

      return f(placeholders);
    };

    return {
      components: components
    };
  }
);