import { Objects } from '@ephox/boulder';
import { Cell, Fun, Option } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';

import DelayedFunction from '../alien/DelayedFunction';
import * as NativeEvents from '../api/events/NativeEvents';
import * as SystemEvents from '../api/events/SystemEvents';

const SIGNIFICANT_MOVE = 5;

const LONGPRESS_DELAY = 400;

const getTouch = function (event) {
  if (event.raw().touches === undefined || event.raw().touches.length !== 1) { return Option.none(); }
  return Option.some(event.raw().touches[0]);
};

// Check to see if the touch has changed a *significant* amount
const isFarEnough = function (touch, data) {
  const distX = Math.abs(touch.clientX - data.x());
  const distY = Math.abs(touch.clientY - data.y());
  return distX > SIGNIFICANT_MOVE || distY > SIGNIFICANT_MOVE;
};

const monitor = function (settings) {
  /* A tap event is a combination of touchstart and touchend on the same element
   * without a *significant* touchmove in between.
   */

  // Need a return value, so can't use Singleton.value;
  const startData = Cell(Option.none());

  const longpress = DelayedFunction(function (event) {
    // Stop longpress firing a tap
    startData.set(Option.none());
    settings.triggerEvent(SystemEvents.longpress(), event);
  }, LONGPRESS_DELAY);

  const handleTouchstart = function (event) {
    getTouch(event).each(function (touch) {
      longpress.cancel();

      const data = {
        x: Fun.constant(touch.clientX),
        y: Fun.constant(touch.clientY),
        target: event.target
      };

      longpress.schedule(event);
      startData.set(Option.some(data));
    });
    return Option.none();
  };

  const handleTouchmove = function (event) {
    longpress.cancel();
    getTouch(event).each(function (touch) {
      startData.get().each(function (data) {
        if (isFarEnough(touch, data)) { startData.set(Option.none()); }
      });
    });
    return Option.none();
  };

  const handleTouchend = function (event) {
    longpress.cancel();

    const isSame = function (data) {
      return Compare.eq(data.target(), event.target());
    };

    return startData.get().filter(isSame).map(function (data) {
      return settings.triggerEvent(SystemEvents.tap(), event);
    });
  };

  const handlers = Objects.wrapAll([
    { key: NativeEvents.touchstart(), value: handleTouchstart },
    { key: NativeEvents.touchmove(), value: handleTouchmove },
    { key: NativeEvents.touchend(), value: handleTouchend }
  ]);

  const fireIfReady = function (event, type): Option<any> {
    return Objects.readOptFrom(handlers, type).bind(function (handler) {
      return handler(event);
    });
  };

  return {
    fireIfReady
  };
};

export {
  monitor
};