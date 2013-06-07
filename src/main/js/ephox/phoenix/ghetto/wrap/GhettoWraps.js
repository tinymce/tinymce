define(
  'ephox.phoenix.ghetto.wrap.GhettoWraps',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    return function (universe, item) {
      var wrap = function (contents) {
        universe.insert().append(item, contents);
      };

      return {
        element: Fun.constant(item),
        wrap: wrap
      };
    };
  }
);
