define(
  'ephox.alloy.api.events.NativeEvents',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    return {
      contextmenu: Fun.constant('contextmenu'),
      touchstart: Fun.constant('touchstart'),
      touchmove: Fun.constant('touchmove'),
      touchend: Fun.constant('touchend')
    };
  }
);
