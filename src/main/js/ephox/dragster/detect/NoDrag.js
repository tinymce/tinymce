define(
  'ephox.dragster.detect.NoDrag',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    return function (anchor) {
      var onEvent = function (event, mode) { };

      return {
        onEvent: onEvent,
        reset: Fun.noop
      };
    };
  }
);
