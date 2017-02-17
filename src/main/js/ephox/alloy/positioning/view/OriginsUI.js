define(
  'ephox.alloy.positioning.view.OriginsUI',

  [
    'ephox.alloy.positioning.layout.Bounds',
    'ephox.alloy.positioning.layout.Boxes',
    'ephox.katamari.api.Fun',
    'ephox.alloy.frame.OuterPosition',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Position',
    'ephox.sugar.api.view.Scroll',
    'ephox.sugar.api.view.Width'
  ],

  function (Bounds, Boxes, Fun, OuterPosition, Height, Position, Scroll, Width) {
    // Moved out of Origins so that Origins can be tested atomically
    // if/when repartee is compiled with NPM modules available, we can switch to `domtest` which allows sugar to load in nodejs

    var toBox = function (origin, element) {
      var rel = Fun.curry(OuterPosition.find, element);
      var position = origin.fold(rel, rel, function () {
        var scroll = Scroll.get();
        // TODO: Make adding the scroll in OuterPosition.find optional.
        return OuterPosition.find(element).translate(-scroll.left(), -scroll.top());
      });

      var width = Width.getOuter(element);
      var height = Height.getOuter(element);
      return Bounds(position.left(), position.top(), width, height);
    };

    var viewport = function (origin, bounds) {
      return bounds.fold(function () {
        /* There are no bounds supplied */
        return origin.fold(Boxes.view, Boxes.view, Bounds);
      }, function (b) {
        /* Use any bounds supplied or make a bounds from the whole viewport for fixed. */
        return origin.fold(b, b, Bounds);
      });
    };

    var translate = function (origin, doc, x, y) {
      var pos = Position(x, y);
      return origin.fold(Fun.constant(pos), Fun.constant(pos), function () {
        var outerScroll = Scroll.get();
        return pos.translate(-outerScroll.left(), -outerScroll.top());
      });
    };

    return {
      toBox: toBox,
      viewport: viewport,
      translate: translate
    };
  }
);