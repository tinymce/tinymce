define(
  'ephox.sugar.api.Attr',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    return {
      has: Fun.constant(false),
      get: Fun.constant(false)
    };
  }
);
