define(
  'ephox.dragster.detect.NoDrag',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    return function (anchor) {
      var onEvent = function (event) {
        var target = event.target();
      };

      return {
        onEvent: onEvent,
        reset: Fun.noop
      };
    };
  }
);
