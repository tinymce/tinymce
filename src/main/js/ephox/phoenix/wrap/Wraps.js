define(
  'ephox.phoenix.wrap.Wraps',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {

    /**
     * Returns an object with a function that wraps nodes with the item
     */
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
