define(
  'ephox.dragster.api.MouseDrag',

  [
    'ephox.perhaps.Option'
  ],

  function (Option) {
    var compare = function (old, nu) {

    };

    var extract = function (event) {

    };

    var predicate = function (event) {

    };

    var onStart = Option.some('mousedown');
    var onStop = Option.some('mouseup');
    var onExit = Option.some('mouseout');
    var onMove = Option.some('mousemove');

    return {
      compare: compare,
      extract: extract,
      predicate: predicate,
      onStart: onStart,
      onStop: onStop,
      onExit: onExit,
      onMove: onMove
    };
  }
);