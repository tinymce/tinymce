define(
  'ephox.agar.mouse.Clicks',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.view.Location',
    'ephox.sugar.api.view.Position'
  ],

  function (Fun, Option, Node, Location, Position) {
    // Note: This can be used for phantomjs.
    var trigger = function (element) {
      if (element.dom().click !== undefined) return element.dom().click();
      // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
      point('click', 0, element);
    };

    var getCoords = function (element) {
      return Node.isElement(element) ? Option.some(Location.absolute(element)) : Option.none();
    };

    var getFromCoords = function (x, y) {
      return x !== undefined && y !== undefined ? Option.some(Position(x, y)) : Option.none();
    };

    var point = function (type, button, element, x, y) {
      var position = getFromCoords(x, y).getOrThunk(function () {
        return getCoords(element).getOr(Position(0, 0));
      });
      var mouseX = position.left();
      var mouseY = position.top();
      // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
      var ev = element.dom().ownerDocument.createEvent('MouseEvents');
      ev.initMouseEvent(
          type,
          true /* bubble */, true /* cancelable */,
          window, null,
          mouseX, mouseY, mouseX, mouseY, /* coordinates */
          false, false, false, false, /* modifier keys */
          button, null
      );
      element.dom().dispatchEvent(ev);
    };

    return {
      trigger: trigger,
      mousedown: Fun.curry(point, 'mousedown', 0),
      mouseup: Fun.curry(point, 'mouseup', 0),
      mousemove: Fun.curry(point, 'mousemove', 0),
      mouseover: Fun.curry(point, 'mouseover', 0),
      mouseout: Fun.curry(point, 'mouseout', 0),
      contextmenu: Fun.curry(point, 'contextmenu', 2)
    };
  }
);