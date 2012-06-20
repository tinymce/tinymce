define(
  'ephox.dragster.move.Drag',

  [
    'ephox.sugar.Css',
    'ephox.sugar.Element',
    'ephox.sugar.Equal',
    'ephox.sugar.Visibility'
  ],

  function (Css, Element, Equal, Visibility) {

    return function (element, anchor, mover) {

      var moving = false;

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
          mover.update(element, event.x, event.y);
          Css.set(element, 'cursor', 'move');
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
