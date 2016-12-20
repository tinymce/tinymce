define(
  'ephox.sugar.api.view.Position',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    var r = function (left, top) {
      var translate = function (x, y) {
        return r(left + x, top + y);
      };

      return {
        left: Fun.constant(left),
        top: Fun.constant(top),
        translate: translate
      };
    };

    return r;
  }
);
