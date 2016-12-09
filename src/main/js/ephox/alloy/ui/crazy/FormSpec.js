define(
  'ephox.alloy.ui.crazy.FormSpec',

  [

  ],

  function () {
    // FIX: Move
    var make = function (detail, components, spec) {
      return {
        uiType: 'custom',
        dom: detail.dom(),
        components: components
      };

    };

    return {
      make: make
    };
  }
);