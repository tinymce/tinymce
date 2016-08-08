define(
  'ephox.alloy.api.SystemEvents',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    return {
      focus: Fun.constant('alloy.focus')
    };
  }
);