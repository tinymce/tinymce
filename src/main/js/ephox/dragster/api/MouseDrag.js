define(
  'ephox.dragster.api.MouseDrag',

  [
    'ephox.perhaps.Option',
    'ephox.sugar.alien.Position'
  ],

  function (Option, Position) {
    var compare = function (old, nu) {
      return Position(nu.left() - old.left(), nu.top() - old.top());
    };

    var extract = function (event) {
      return Position(event.x(), event.y());
    };

    var predicate = function (event) {
      return true;
    };

    var mutate = function (mutation, info) {
      console.log('info', info);
      mutation.mutate(info.left(), info.top());
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
      onMove: onMove,
      mutate: mutate
    };
  }
);