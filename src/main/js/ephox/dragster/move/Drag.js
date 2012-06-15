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
        // TODO: Check if event.target is cross-browser
        return Element(event.target);
      };

      var mousedown = function (event, ui) {
        console.log('event.mousedown');
        var target = getTarget(event);
        moving = true;
      };

      var mouseup = function (event, ui) {
        console.log('event.mouseup');
        moving = false;
      };



      var mousemove = function (event, ui) {
        if (moving) {
          mover.update(element, event.x, event.y);
        } else {
          var target = getTarget(event);
          if (Equal.eq(target, anchor)) {
            Css.set(target, 'cursor', 'pointer');
          }
        }
      };

      return {
        mousedown: runIfActive(mousedown),
        mouseup: runIfActive(mouseup),
        mousemove: runIfActive(mousemove)
      };
    };
  }
);
