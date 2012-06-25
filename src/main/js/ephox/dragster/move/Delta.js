define(
  'ephox.dragster.move.Delta',

  [
    'ephox.perhaps.Option',
    'ephox.sugar.Position'
  ],

  function (Option, Position) {

    return function () {

      var position = Option.none();

      var update = function (newX, newY) {

        var result = position.fold(function () {
          return Position(0, 0);
        }, function (v) {
          return Position(newX - v.left(), newY - v.top());
        });

        position = Option.some(Position(newX, newY));
        return result;
      };

      return {
        update: update
      };
    };
  }
);
