import { Cell, Optional, Singleton, Throttler } from '@ephox/katamari';

import Editor from '../api/Editor';

// This is based heavily on Alloy's TapEvent.ts, just modified to use TinyMCE's event system.

const SIGNIFICANT_MOVE = 5;
const LONGPRESS_DELAY = 400;

export interface TouchHistoryData {
  readonly x: number;
  readonly y: number;
  readonly target: Node;
}

const getTouch = (event: TouchEvent): Optional<Touch> => {
  if (event.touches === undefined || event.touches.length !== 1) {
    return Optional.none();
  }
  return Optional.some(event.touches[0]);
};

const isFarEnough = (touch: Touch, data: TouchHistoryData): boolean => {
  const distX = Math.abs(touch.clientX - data.x);
  const distY = Math.abs(touch.clientY - data.y);
  return distX > SIGNIFICANT_MOVE || distY > SIGNIFICANT_MOVE;
};

const setup = (editor: Editor): void => {
  const startData = Singleton.value<TouchHistoryData>();
  const longpressFired = Cell<boolean>(false);

  const debounceLongpress = Throttler.last((e) => {
    editor.dispatch('longpress', { ...e, type: 'longpress' });
    longpressFired.set(true);
  }, LONGPRESS_DELAY);

  editor.on('touchstart', (e) => {
    getTouch(e).each((touch) => {
      debounceLongpress.cancel();

      const data: TouchHistoryData = {
        x: touch.clientX,
        y: touch.clientY,
        target: e.target
      };

      debounceLongpress.throttle(e);
      longpressFired.set(false);
      startData.set(data);
    });
  }, true);

  editor.on('touchmove', (e) => {
    debounceLongpress.cancel();
    getTouch(e).each((touch) => {
      startData.on((data) => {
        if (isFarEnough(touch, data)) {
          startData.clear();
          longpressFired.set(false);
          editor.dispatch('longpresscancel');
        }
      });
    });
  }, true);

  editor.on('touchend touchcancel', (e) => {
    debounceLongpress.cancel();

    if (e.type === 'touchcancel') {
      return;
    }

    // Cancel the touchend event if a longpress was fired, otherwise fire the tap event
    startData.get()
      .filter((data) => data.target.isEqualNode(e.target))
      .each(() => {
        if (longpressFired.get()) {
          e.preventDefault();
        } else {
          editor.dispatch('tap', { ...e, type: 'tap' });
        }
      });
  }, true);
};

export { setup };
