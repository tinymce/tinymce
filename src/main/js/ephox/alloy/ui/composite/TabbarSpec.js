define(
  'ephox.alloy.ui.composite.TabbarSpec',

  [

  ],

  function () {
    var make = function (detail, components, spec, externals) {
      return {
        uiType: 'custom',
        dom: {
          tag: 'span',
          classes: [ 'tabbar' ]
        }
      };
    };

    return {
      make: make
    };
  }
);