define(
  'ephox.alloy.api.behaviour.Behaviour',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    return {
      revoke: Fun.constant(undefined)
    };
  }
);