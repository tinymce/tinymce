define(
  'ephox.alloy.dragging.mouse.MouseData',

  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.view.Position'
  ],

  function (Option, Position) {
    var getData = function (event) {
      return Option.from(Position(event.x(), event.y()));
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
