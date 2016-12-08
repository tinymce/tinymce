define(
  'ephox.alloy.ui.composite.TabviewSpec',

  [

  ],

  function () {
    var make = function (detail, components, spec, externals) {
      return {
        uiType: 'custom',
        dom: {
          tag: 'span',
          classes: [ 'tabview' ]
        }
      };
    };

    return {
      make: make
    };
  }
);