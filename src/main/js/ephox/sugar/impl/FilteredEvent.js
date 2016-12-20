define(
  'ephox.sugar.impl.FilteredEvent',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element'
  ],

  function (Fun, Element) {

    var mkEvent = function (target, x, y, stop, prevent, kill, raw) {
      // switched from a struct to manual Fun.constant() because we are passing functions now, not just values
      return {
        'target':  Fun.constant(target),
        'x':       Fun.constant(x),
        'y':       Fun.constant(y),
        'stop':    stop,
        'prevent': prevent,
        'kill':    kill,
        'raw':     Fun.constant(raw)
      };
    };

    var handle = function (filter, handler) {
      return function (rawEvent) {
        if (!filter(rawEvent)) return;

        // IE9 minimum
        var target = Element.fromDom(rawEvent.target);

        var stop = function () {
          rawEvent.stopPropagation();
        };

        var prevent = function () {
          rawEvent.preventDefault();
        };

        var kill = Fun.compose(prevent, stop); // more of a sequence than a compose, but same effect

        // FIX: Don't just expose the raw event. Need to identify what needs standardisation.
        var evt = mkEvent(target, rawEvent.clientX, rawEvent.clientY, stop, prevent, kill, rawEvent);
        handler(evt);
      };
    };

    var binder = function (element, event, filter, handler, useCapture) {
      var wrapped = handle(filter, handler);
      // IE9 minimum
      element.dom().addEventListener(event, wrapped, useCapture);

      return {
        unbind: Fun.curry(unbind, element, event, wrapped, useCapture)
      };
    };

    var bind = function (element, event, filter, handler) {
      return binder(element, event, filter, handler, false);
    };

    var capture = function (element, event, filter, handler) {
      return binder(element, event, filter, handler, true);
    };

    var unbind = function (element, event, handler, useCapture) {
      // IE9 minimum
      element.dom().removeEventListener(event, handler, useCapture);
    };

    return {
      bind: bind,
      capture: capture
    };
  }
);