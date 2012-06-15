define(
  'ephox.dragster.move.Mover',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.Css',
    'ephox.sugar.Location'
  ],

  function (Fun, Option, Css, Location) {

    return function () {

      var lastX = Option.none();
      var lastY = Option.none();

      var update = function (element, newX, newY) {

        var deltaX = lastX.fold(Fun.constant(0), function (x) {
          return newX - x;
        });

        var deltaY = lastY.fold(Fun.constant(0), function (y) {
          return newY - y;
        });
        
        if (deltaX !== 0 || deltaY !== 0) {
          var position = Location.absolute(element);
          var left = position.left() + deltaX;
          var top = position.top() + deltaY;
          Css.set(element, 'left', left);
          Css.set(element, 'top', top);
        }

        lastX = Option.some(newX);
        lastY = Option.some(newY);
      };

      return {
        update: update
      };
    };


  }
);
