import { Objects } from '@ephox/boulder';
import { Cell, Fun, Option } from '@ephox/katamari';
import { Compare, Element } from '@ephox/sugar';
import { Touch, TouchEvent } from '@ephox/dom-globals';

import DelayedFunction from '../alien/DelayedFunction';
import * as NativeEvents from '../api/events/NativeEvents';
import * as SystemEvents from '../api/events/SystemEvents';
import { SugarEvent } from '../alien/TypeDefinitions';
import { GuiEventSettings } from './GuiEvents';

const SIGNIFICANT_MOVE = 5;

const LONGPRESS_DELAY = 400;

const getTouch = (event: SugarEvent): Option<Touch> => {
  const raw = event.raw() as TouchEvent;
  if (raw.touches === undefined || raw.touches.length !== 1) { return Option.none(); }
  return Option.some(raw.touches[0]);
};

// Check to see if the touch has changed a *significant* amount
const isFarEnough = (touch: Touch, data: TouchHistoryData): boolean => {
  const distX = Math.abs(touch.clientX - data.x());
  const distY = Math.abs(touch.clientY - data.y());
  return distX > SIGNIFICANT_MOVE || distY > SIGNIFICANT_MOVE;
};

export interface TouchHistoryData {
  x: () => number;
  y: () => number;
  target: () => Element;
}

const monitor = (settings: GuiEventSettings) => {
  /* A tap event is a combination of touchstart and touchend on the same element
   * without a *significant* touchmove in between.
   */

  // Need a return value, so can't use Singleton.value;
  const startData: Cell<Option<TouchHistoryData>> = Cell(Option.none());
  const longpressFired = Cell<boolean>(false);

  const longpress = DelayedFunction((event: SugarEvent) => {
    settings.triggerEvent(SystemEvents.longpress(), event);
    longpressFired.set(true);
  }, LONGPRESS_DELAY);

  const handleTouchstart = (event: SugarEvent): Option<boolean> => {
    getTouch(event).each((touch) => {
      longpress.cancel();

      const data = {
        x: Fun.constant(touch.clientX),
        y: Fun.constant(touch.clientY),
        target: event.target
      };

      longpress.schedule(event);
      longpressFired.set(false);
      startData.set(Option.some(data));
    });
    return Option.none();
  };

  const handleTouchmove = (event: SugarEvent): Option<boolean> => {
    longpress.cancel();
    getTouch(event).each((touch) => {
      startData.get().each((data) => {
        if (isFarEnough(touch, data)) { startData.set(Option.none()); }
      });
    });
    return Option.none();
  };

  const handleTouchend = (event: SugarEvent): Option<boolean> => {
    longpress.cancel();

    const isSame = (data) => {
      return Compare.eq(data.target(), event.target());
    };

    return startData.get().filter(isSame).map((data) => {
      if (longpressFired.get()) {
        event.prevent();
        return false;
      } else {
        return settings.triggerEvent(SystemEvents.tap(), event);
      }
    });
  };

  const handlers = Objects.wrapAll([
    { key: NativeEvents.touchstart(), value: handleTouchstart },
    { key: NativeEvents.touchmove(), value: handleTouchmove },
    { key: NativeEvents.touchend(), value: handleTouchend }
  ]);

  const fireIfReady = (event: SugarEvent, type: string): Option<boolean> => {
    return Objects.readOptFrom<any>(handlers, type).bind((handler: (evt: SugarEvent) => Option<boolean>): Option<boolean> => {
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
