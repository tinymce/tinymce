define(
  'ephox.alloy.navigation.Navigator',

  [
    'ephox.scullion.Struct',
    'ephox.sugar.api.Direction'
  ],

  function (Struct, Direction) {
    var delta = Struct.immutable('x', 'y');

    var actualWest = delta(-1, 0);
    var actualEast = delta(+1, 0);

    var west = Direction.onDirection(actualWest, actualEast);
    var east = Direction.onDirection(actualEast, actualWest);

    var north = function (_container) { return delta(0, -1); };
    var south = function (_container) { return delta(0, +1); };

    return {
      east: east,
      west: west,
      north: north,
      south: south
    };
  }
);