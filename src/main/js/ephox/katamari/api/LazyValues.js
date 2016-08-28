define(
  'ephox.katamari.api.LazyValues',

  [
    'ephox.katamari.api.LazyValue',
    'ephox.katamari.async.AsyncValues'
  ],

  function (LazyValue, AsyncValues) {
    /** [LazyValue a] -> LazyValue [a] */
    var par = function (lazyValues) {
      return AsyncValues.par(lazyValues, LazyValue.nu);
    };

    return {
      par: par
    };
  }
);