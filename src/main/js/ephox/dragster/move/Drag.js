define(
  'ephox.dragster.move.Drag',

  [
    'ephox.dragster.move.Blocker',
    'ephox.dragster.move.Delta',
    'ephox.sugar.Css',
    'ephox.sugar.Element',
    'ephox.sugar.Equal',
    'ephox.sugar.Location',
    'ephox.sugar.Visibility'
  ],

  function (Block, Delta, Css, Element, Equal, Location, Visibility) {

    return function (element, anchor, mover) {

      var moving = false;

      var blocker = Block();
      var doc = Element(document);

      var delta = Delta();

      var runIfActive = function (f) {
        return function (event, ui) {
          if (Visibility.isVisible(element)) f(event, ui);
        };
      };

      var getTarget = function (event) {
        // TODO: Check this is cross-browser.
        var sEvent = event || window.event;
        return Element(sEvent.target || sEvent.srcElement);
      };

      var mousedown = function (event, ui) {
        var target = getTarget(event);
        moving = true;
      };

      var mouseup = function (event, ui) {
        moving = false;
      };

      var mousemove = function (event, ui) {
        if (moving) {
          var offset = delta.update(event.x, event.y);
          var location = Location.absolute(element);
          Css.setAll(element, {
            cursor: 'move',
            left: location.left() + offset.left(),
            top: location.top() + offset.top()
          });
        } else {
          var target = getTarget(event);
          if (Equal.eq(target, anchor)) {
            Css.set(target, 'cursor', 'pointer');
          }
        }
      };

      var stop = function () {
        moving = false;
      };

      return {
        mousedown: runIfActive(mousedown),
        mouseup: runIfActive(mouseup),
        mousemove: runIfActive(mousemove),
        stop: stop
      };
    };
  }
);
