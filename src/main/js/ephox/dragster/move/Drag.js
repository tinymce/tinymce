define(
  'ephox.dragster.move.Drag',

  [
    'ephox.dragster.move.Blocker',
    'ephox.dragster.move.Delta',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Visibility'
  ],

  function (Block, Delta, Compare, Css, Element, Insert, Location, Remove, Visibility) {

    return function (element, anchor, blocker) {

      var moving = false;
      var doc = Element.fromDom(document.body);

      var delta = Delta();

      var runIfActive = function (f) {
        return function (event, ui) {
          if (Visibility.isVisible(element)) f(event, ui);
        };
      };

      var getTarget = function (event) {
        // TODO: Check this is cross-browser.
        var sEvent = event || window.event;
        return Element.fromDom(sEvent.target || sEvent.srcElement);
      };

      var mousedown = function (event, ui) {
        var target = getTarget(event);
        Insert.append(doc, blocker);
        moving = true;
      };

      var drop = function () {
        moving = false;
        Remove.remove(blocker);
        delta.reset();
      };

      var mouseup = function (event, ui) {
        drop();
      };

      var mousemove = function (event, ui) {
        if (moving) {
          var offset = delta.update(event.x, event.y);
          offset.each(function (v) {
            var location = Location.absolute(element);
            Css.setAll(element, {
              left: location.left() + v.left(),
              top: location.top() + v.top()
            });
          });
        } else {
          var target = getTarget(event);
          if (Compare.eq(target, anchor)) {
            Css.set(target, 'cursor', 'pointer');
          }
        }
      };

      var stop = drop;

      return {
        mousedown: runIfActive(mousedown),
        mouseup: runIfActive(mouseup),
        mousemove: runIfActive(mousemove),
        stop: stop
      };
    };
  }
);
