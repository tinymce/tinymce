define(
  'ephox.alloy.alien.Boxes',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Struct',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Location',
    'ephox.sugar.api.view.Width'
  ],

  function (Fun, Struct, Height, Location, Width) {
    var pointed = Struct.immutable('point', 'width', 'height');
    var rect = Struct.immutable('x', 'y', 'width', 'height');

    var bounds = function (x, y, width, height) {
      return {
        x: Fun.constant(x),
        y: Fun.constant(y),
        width: Fun.constant(width),
        height: Fun.constant(height),
        right: Fun.constant(x + width),
        bottom: Fun.constant(y + height)
      };
    };

    var box = function (element) {
      var xy = Location.absolute(element);
      var w = Width.getOuter(element);
      var h = Height.getOuter(element);
      return bounds(xy.left(), xy.top(), w, h);
    };

    return {
      pointed: pointed,
      rect: rect,
      bounds: bounds,
      box: box
    };
  }
);