import { Arr, Fun } from '@ephox/katamari';

const inSet = function (keys) {
  return function (event) {
    return Arr.contains(keys, event.raw().which);
  };
};

const and = function (preds) {
  return function (event) {
    return Arr.forall(preds, function (pred) {
      return pred(event);
    });
  };
};

const is = function (key) {
  return function (event) {
    return event.raw().which === key;
  };
};

const isShift = function (event) {
  return event.raw().shiftKey === true;
};

const isControl = function (event) {
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