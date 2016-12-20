define(
  'ephox.sugar.api.events.Resize',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sand.api.Window',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.events.Viewable',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Visibility',
    'ephox.sugar.api.view.Width',
    'ephox.sugar.impl.Monitors',
    'global!setTimeout',
    'global!window'
  ],

  function (Arr, Fun, Option, Window, Compare, DomEvent, Viewable, Element, Height, Visibility, Width, Monitors, setTimeout, window) {
    var elem = function (element) {
      return {
        element: element,
        handlers: [],
        lastWidth: Width.get(element),
        lastHeight: Height.get(element)
      };
    };
    var elems = [];

    var findElem = function (element) {
      return Arr.findIndex(elems, function (el) {
        return Compare.eq(el.element, element);
      }).getOr(-1);
    };

    var bind = function (element, handler) {
      var el = Arr.find(elems, function (el) {
        return Compare.eq(el.element, element);
      }).getOr(undefined);
      if (el === undefined) {
        el = elem(element);
        elems.push(el);
      }
      el.handlers.push(handler);
      if (interval.isNone()) start();

      // Fire an update event for this element on every bind call.
      // This is really handy if the element is currently hidden, the resize event
      // will fire as soon as it becomes visible.
      setTimeout(function () {
        // Ensure we don't attempt to update something that is unbound in the 100ms since the bind call
        if (findElem(el.element) !== -1) update(el);
      }, 100);
    };

    var unbind = function (element, handler) {
      // remove any monitors on this element
      Monitors.end(element);
      var index = findElem(element);
      if (index === -1) return;

      var handlerIndex = Arr.indexOf(elems[index].handlers, handler);
      if (handlerIndex === -1) return;

      elems[index].handlers.splice(handlerIndex, 1);
      if (elems[index].handlers.length === 0) elems.splice(index, 1);
      if (elems.length === 0) stop();
    };

    var visibleUpdate = function (el) {
      var w = Width.get(el.element);
      var h = Height.get(el.element);
      if (w !== el.lastWidth || h !== el.lastHeight) {
        el.lastWidth = w;
        el.lastHeight = h;
        Arr.each(el.handlers, Fun.apply);
      }
    };

    var update = function (el) {
      var element = el.element;
      // if already visible, run the update
      if (Visibility.isVisible(element)) visibleUpdate(el);
      // otherwise begin a monitor on the element (which does nothing if we're already monitoring)
      else Monitors.begin(element, function () {
        // the monitor is "wait for viewable"
        return Viewable.onShow(element, function () {
          Monitors.end(element);
          visibleUpdate(el);
        });
      });
    };


    // Don't use peanut Throttler, requestAnimationFrame is much much better than setTimeout for resize/scroll events:
    // http://www.html5rocks.com/en/tutorials/speed/animations/
    var throttle = false;
    var runHandler = function () {
      throttle = false;
      // cancelAnimationFrame isn't stable yet, so we can't pass events to the callback (they would be out of date)
      Arr.each(elems, update);
    };

    var listener = function () {
      // cancelAnimationFrame isn't stable yet, so we just ignore all subsequent events until the next animation frame
      if (!throttle) {
        throttle = true;
        Window.requestAnimationFrame(runHandler);
      }
    };

    var interval = Option.none();
    var start = function () {
      interval = Option.some(DomEvent.bind(Element.fromDom(window), 'resize', listener));
    };

    var stop = function () {
      interval.each(function (f) {
        f.unbind();
        interval = Option.none();
      });
    };

    return {
      bind: bind,
      unbind: unbind
    };
  }

);