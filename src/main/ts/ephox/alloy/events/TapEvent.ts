import DelayedFunction from '../alien/DelayedFunction';
import NativeEvents from '../api/events/NativeEvents';
import SystemEvents from '../api/events/SystemEvents';
import { Objects } from '@ephox/boulder';
import { Cell } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';

var SIGNIFICANT_MOVE = 5;

var LONGPRESS_DELAY = 400;

var getTouch = function (event) {
  if (event.raw().touches === undefined || event.raw().touches.length !== 1) return Option.none();
  return Option.some(event.raw().touches[0]);
};

// Check to see if the touch has changed a *significant* amount
var isFarEnough = function (touch, data) {
  var distX = Math.abs(touch.clientX - data.x());
  var distY = Math.abs(touch.clientY - data.y());
  return distX > SIGNIFICANT_MOVE || distY > SIGNIFICANT_MOVE;
};

var monitor = function (settings) {
  /* A tap event is a combination of touchstart and touchend on the same element
   * without a *significant* touchmove in between.
   */

  // Need a return value, so can't use Singleton.value;
  var startData = Cell(Option.none());

  var longpress = DelayedFunction(function (event) {
    // Stop longpress firing a tap
    startData.set(Option.none());
    settings.triggerEvent(SystemEvents.longpress(), event);
  }, LONGPRESS_DELAY);

  var handleTouchstart = function (event) {
    getTouch(event).each(function (touch) {
      longpress.cancel();

      var data = {
        x: Fun.constant(touch.clientX),
        y: Fun.constant(touch.clientY),
        target: event.target
      };

      longpress.schedule(data);
      startData.set(Option.some(data));
    });
    return Option.none();
  };

  var handleTouchmove = function (event) {
    longpress.cancel();
    getTouch(event).each(function (touch) {
      startData.get().each(function (data) {
        if (isFarEnough(touch, data)) startData.set(Option.none());
      });
    });
    return Option.none();
  };

  var handleTouchend = function (event) {
    longpress.cancel();

    var isSame = function (data) {
      return Compare.eq(data.target(), event.target());
    };

    return startData.get().filter(isSame).map(function (data) {
      return settings.triggerEvent(SystemEvents.tap(), event);
    });
  };

  var handlers = Objects.wrapAll([
    { key: NativeEvents.touchstart(), value: handleTouchstart },
    { key: NativeEvents.touchmove(), value: handleTouchmove },
    { key: NativeEvents.touchend(), value: handleTouchend }
  ]);

  var fireIfReady = function (event, type) {
    return Objects.readOptFrom(handlers, type).bind(function (handler) {
      return handler(event);
    });
  };

  return {
    fireIfReady: fireIfReady
  };
};

export default <any> {
  monitor: monitor
};