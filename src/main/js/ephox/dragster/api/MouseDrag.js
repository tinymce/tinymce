define(
  'ephox.dragster.api.MouseDrag',

  [
    'ephox.dragster.api.DragMode',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.alien.Position'
  ],

  function (DragMode, Fun, Option, Position) {
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
      mutation.mutate(info.left(), info.top());
    };

    var onStart = Option.some('mousedown');
    var onStop = Option.some('mouseup');
    var onExit = Option.some('mouseout');
    var onMove = Option.some('mousemove');

    return DragMode({
      compare: compare,
      extract: extract,
      predicate: predicate,
      onStart: Fun.constant(onStart),
      onStop: Fun.constant(onStop),
      onExit: Fun.constant(onExit),
      onMove: Fun.constant(onMove),
      mutate: mutate
    });
  }
);