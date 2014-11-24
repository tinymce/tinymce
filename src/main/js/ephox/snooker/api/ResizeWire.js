define(
  'ephox.snooker.api.ResizeWire',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.alien.Position',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Location'
  ],

  function (Fun, Option, Position, Element, Location) {
    // parent: the container for adding the resize bars
    // view: the container who listens to mouse events designed to show and hide the bars
    // origin: the offset for the point to display the bars in the appropriate position

    var only = function (element) {
      // If we are a document, use the document element for appending.
      var parent = Option.from(element.dom().documentElement).map(Element.fromDom).getOr(element);
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