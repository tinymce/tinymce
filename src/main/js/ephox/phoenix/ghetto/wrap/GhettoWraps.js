define(
  'ephox.phoenix.ghetto.wrap.GhettoWraps',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    var simple = function (universe) {
      var span = universe.create().nu('span');
      return basic(universe, span);
    };

    var basic = function (universe, item) {
      var element = Fun.constant(item);
      var wrap = function (contents) {
        universe.insert().append(item, contents);
      };

      return {
        element: element,
        wrap: wrap
      };
    };

    return {
      simple: simple,
      basic: basic
    };

  }
);
