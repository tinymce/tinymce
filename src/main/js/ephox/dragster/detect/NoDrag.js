define(
  'ephox.dragster.detect.NoDrag',

  [
    'ephox.peanut.Fun',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Css'
  ],

  function (Fun, Compare, Css) {
    return function (anchor) {
      var onEvent = function (event) {
        var target = event.target();
        if (Compare.eq(target, anchor)) {
          Css.set(target, 'cursor', 'pointer');
        }
      };

      return {
        onEvent: onEvent,
        reset: Fun.noop
      };
    };
  }
);
