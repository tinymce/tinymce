import { Touch } from '@ephox/dom-globals';
import { Cell, Fun, Option } from '@ephox/katamari';
import DelayedFunction from '../alien/DelayedFunction';

// This is based heavily on Alloy's TapEvent.ts, just modified to use TinyMCE's event system.

const SIGNIFICANT_MOVE = 5;
const LONGPRESS_DELAY = 400;

export interface TouchHistoryData {
  x: () => number;
  y: () => number;
  target: () => any;
}

const getTouch = (event): Option<Touch> => {
  if (event.touches === undefined || event.touches.length !== 1) {
    return Option.none();
  }
  return Option.some(event.touches[0]);
};

const startData = Cell<Option<TouchHistoryData>>(Option.none());

const isFarEnough = (touch, data: TouchHistoryData): boolean => {
  const distX = Math.abs(touch.clientX - data.x());
  const distY = Math.abs(touch.clientY - data.y());
  return distX > SIGNIFICANT_MOVE || distY > SIGNIFICANT_MOVE;
};

const setupLongpress = (editor) => {
  const longpress = DelayedFunction((e) => editor.fire('longpress', { rawEvent: { ...e, type: 'longpress' } }), LONGPRESS_DELAY);

  editor.on('touchstart', (e) => {
    getTouch(e).each((touch) => {
      longpress.cancel();

      const data = {
        x: Fun.constant(touch.clientX),
        y: Fun.constant(touch.clientY),
        target: Fun.constant(e.target)
      };

      longpress.schedule(e);
      startData.set(Option.some(data));
    });
  }, true);

  editor.on('touchmove', (e) => {
    longpress.cancel();
    getTouch(e).each((touch) => {
      startData.get().each((data) => {
        if (isFarEnough(touch, data)) {
          startData.set(Option.none());
          editor.fire('longpresscancel');
        }
      });
    });
  }, true);

  editor.on('touchend touchcancel', (_e) => {
    longpress.cancel();
  }, true);
};

export default { setupLongpress };
