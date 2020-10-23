import { Objects } from '@ephox/boulder';
import { Cell, Obj, Optional } from '@ephox/katamari';
import { Compare, EventArgs, SugarElement } from '@ephox/sugar';

import DelayedFunction from '../alien/DelayedFunction';
import * as NativeEvents from '../api/events/NativeEvents';
import * as SystemEvents from '../api/events/SystemEvents';
import { GuiEventSettings } from './GuiEvents';

const SIGNIFICANT_MOVE = 5;

const LONGPRESS_DELAY = 400;

const getTouch = (event: EventArgs<TouchEvent>): Optional<Touch> => {
  const raw = event.raw;
  if (raw.touches === undefined || raw.touches.length !== 1) { return Optional.none(); }
  return Optional.some(raw.touches[0]);
};

// Check to see if the touch has changed a *significant* amount
const isFarEnough = (touch: Touch, data: TouchHistoryData): boolean => {
  const distX = Math.abs(touch.clientX - data.x);
  const distY = Math.abs(touch.clientY - data.y);
  return distX > SIGNIFICANT_MOVE || distY > SIGNIFICANT_MOVE;
};

export interface TouchHistoryData {
  x: number;
  y: number;
  target: SugarElement;
}

const monitor = (settings: GuiEventSettings) => {
  /* A tap event is a combination of touchstart and touchend on the same element
   * without a *significant* touchmove in between.
   */

  // Need a return value, so can't use Singleton.value;
  const startData: Cell<Optional<TouchHistoryData>> = Cell(Optional.none());
  const longpressFired = Cell<boolean>(false);

  const longpress = DelayedFunction((event: EventArgs) => {
    settings.triggerEvent(SystemEvents.longpress(), event);
    longpressFired.set(true);
  }, LONGPRESS_DELAY);

  const handleTouchstart = (event: EventArgs<TouchEvent>): Optional<boolean> => {
    getTouch(event).each((touch) => {
      longpress.cancel();

      const data = {
        x: touch.clientX,
        y: touch.clientY,
        target: event.target
      };

      longpress.schedule(event);
      longpressFired.set(false);
      startData.set(Optional.some(data));
    });
    return Optional.none();
  };

  const handleTouchmove = (event: EventArgs<TouchEvent>): Optional<boolean> => {
    longpress.cancel();
    getTouch(event).each((touch) => {
      startData.get().each((data) => {
        if (isFarEnough(touch, data)) { startData.set(Optional.none()); }
      });
    });
    return Optional.none();
  };

  const handleTouchend = (event: EventArgs): Optional<boolean> => {
    longpress.cancel();

    const isSame = (data: TouchHistoryData) => Compare.eq(data.target, event.target);

    return startData.get().filter(isSame).map((_data) => {
      if (longpressFired.get()) {
        event.prevent();
        return false;
      } else {
        return settings.triggerEvent(SystemEvents.tap(), event);
      }
    });
  };

  const handlers: Record<string, (event: EventArgs) => Optional<boolean>> = Objects.wrapAll([
    { key: NativeEvents.touchstart(), value: handleTouchstart },
    { key: NativeEvents.touchmove(), value: handleTouchmove },
    { key: NativeEvents.touchend(), value: handleTouchend }
  ]);

  const fireIfReady = (event: EventArgs, type: string): Optional<boolean> => Obj.get(handlers, type).bind((handler) => handler(event));

  return {
    fireIfReady
  };
};

export {
  monitor
};
