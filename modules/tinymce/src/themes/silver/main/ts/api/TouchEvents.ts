import { console, Touch } from '@ephox/dom-globals';
import { Cell, Fun, Option } from '@ephox/katamari';
import DelayedFunction from '../alien/DelayedFunction';
import { Compare, Element } from '@ephox/sugar';

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
const longpressFlag = Cell<boolean>(false);

const isFarEnough = (touch, data: TouchHistoryData): boolean => {
  const distX = Math.abs(touch.clientX - data.x());
  const distY = Math.abs(touch.clientY - data.y());
  return distX > SIGNIFICANT_MOVE || distY > SIGNIFICANT_MOVE;
};

const setupLongpress = (editor) => {
  const longpress = DelayedFunction((e) => {
    // Stop longpress firing a tap
    startData.set(Option.none());
    longpressFlag.set(true);
    editor.fire('longpress', { rawEvent: { ...e, type: 'longpress' } });
  }, LONGPRESS_DELAY);

  editor.on('touchstart', (e) => {
    console.log('touchstart', e);
    longpressFlag.set(false);
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
    console.log('touchmove');
    getTouch(e).each((touch) => {
      startData.get().each((data) => {
        if (isFarEnough(touch, data)) {
          startData.set(Option.none());
        }
      });
    });
  }, true);

  editor.on('touchend', (e) => {
    console.log('touchend');

    longpress.cancel();

    const isSame = (data) => {
      return Compare.eq(Element.fromDom(data.target()), Element.fromDom(e.target));
    };

    startData.get().fold(longpress.cancel, (data) => {
      if (isSame(data) && longpressFlag.get()) {
        console.log('fire longpress 2');
        e.preventDefault();
        longpressFlag.set(false);
      }
    });
  }, true);
};

export default { setupLongpress };
