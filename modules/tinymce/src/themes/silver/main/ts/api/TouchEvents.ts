import { console, Touch } from '@ephox/dom-globals';
import { Cell, Fun, Option } from '@ephox/katamari';
import DelayedFunction from '../alien/DelayedFunction';

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
    // tslint:disable-next-line: no-console
    console.log(e);
    longpressFlag.set(true);
    editor.fire('longpress', { rawEvent: { ...e, type: 'longpress' } });
  }, LONGPRESS_DELAY);

  editor.on('touchstart', (e) => {
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
    // tslint:disable-next-line: no-console
    console.log('touchmove');
    longpress.cancel();
    getTouch(e).each((touch) => {
      // tslint:disable-next-line: no-console
      console.log('startdata', startData.get());
      startData.get().each((data) => {
        // tslint:disable-next-line: no-console
        console.log(touch, data, isFarEnough(touch, data));
        if (isFarEnough(touch, data)) {
          startData.set(Option.none());
          editor.fire('longpresscancel');
        }
      });
    });
  }, true);

  editor.on('touchend touchcancel', (e) => {
    console.log('end cancel');
    longpress.cancel();
  }, true);
};

export default { setupLongpress };
