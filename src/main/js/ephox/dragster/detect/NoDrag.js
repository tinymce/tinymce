define(
  'ephox.dragster.detect.NoDrag',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    return function (anchor) {
      var onEvent = function (event) {
        var target = event.target();
        // Might want this later, but not now.
        // if (Compare.eq(target, anchor)) {
        //   Css.set(target, 'cursor', 'pointer');
        // }
      };

      return {
        onEvent: onEvent,
        reset: Fun.noop
      };
    };
  }
);
