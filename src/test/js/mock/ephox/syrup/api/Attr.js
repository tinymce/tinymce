define(
  'ephox.sugar.api.properties.Attr',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    return {
      has: Fun.constant(false),
      get: Fun.constant(false)
    };
  }
);
