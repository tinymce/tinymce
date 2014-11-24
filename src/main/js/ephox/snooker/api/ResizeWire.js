define(
  'ephox.snooker.api.ResizeWire',

  [
    'ephox.peanut.Fun',
    'ephox.scullion.Struct',
    'ephox.sugar.alien.Position',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Location'
  ],

  function (Fun, Struct, Position, Element, Location) {
    var only = function (element) {
      var parent = element.dom().documentElement ? Element.fromDom(element.dom().documentElement) : element;
      return {
        parent: Fun.constant(parent),
        view: Fun.constant(element),
        origin: Fun.constant(Position(0, 0))
      };
    };

    var detached = function (editable, chrome) {
      var origin = Fun.curry(Location.absolute, chrome);
      return {
        parent: Fun.constant(chrome),
        view: Fun.constant(editable),
        origin: origin
      };
    };

    return {
      only: only,
      detached: detached
    };
  }
);