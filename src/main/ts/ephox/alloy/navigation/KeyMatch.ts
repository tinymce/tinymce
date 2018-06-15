import { Arr, Fun } from '@ephox/katamari';

const inSet = (keys) => {
  return (event) => {
    return Arr.contains(keys, event.raw().which);
  };
};

const and = (preds) => {
  return (event) => {
    return Arr.forall(preds, (pred) => {
      return pred(event);
    });
  };
};

const is = (key) => {
  return (event) => {
    return event.raw().which === key;
  };
};

const isShift = (event) => {
  return event.raw().shiftKey === true;
};

const isControl = (event) => {
  return event.raw().ctrlKey === true;
};

const isNotControl = Fun.not(isControl);
const isNotShift = Fun.not(isShift);

export {
  inSet,
  and,
  is,
  isShift,
  isNotShift,
  isControl,
  isNotControl
};