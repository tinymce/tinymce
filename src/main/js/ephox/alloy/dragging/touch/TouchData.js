define(
  'ephox.alloy.dragging.touch.TouchData',

  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.view.Position'
  ],

  function (Option, Position) {
    var getDataFrom = function (touches) {
      var touch = touches[0];
      return Option.some(Position(touch.clientX, touch.clientY));
    };

    var getData = function (event) {
      var touches = event.raw().touches;
      return touches.length === 1 ? getDataFrom(touches) : Option.none();
    };

    // When dragging with the mouse, the delta is simply the difference
    // between the two position (previous/old and next/nu)
    var getDelta = function (old, nu) {
      return Position(nu.left() - old.left(), nu.top() - old.top());
    };

    return {
      getData: getData,
      getDelta: getDelta
    };
  }
);