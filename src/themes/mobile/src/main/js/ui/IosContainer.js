define(
  'tinymce.themes.mobile.ui.IosContainer',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element'
  ],

  function (Fun, Element) {
    return function () {
      var div = Element.fromTag('div');

      return {
        element: Fun.constant(div)
      };
    };
  }
);
