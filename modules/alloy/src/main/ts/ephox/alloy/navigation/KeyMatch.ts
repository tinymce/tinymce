import { KeyboardEvent } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import { EventArgs } from '@ephox/sugar';

export type KeyMatcher = (evt: EventArgs) => boolean;

const inSet = (keys: number[]): KeyMatcher => {
  return (event: EventArgs<KeyboardEvent>) => {
    const raw = event.raw();
    return Arr.contains(keys, raw.which);
  };
};

const and = (preds: KeyMatcher[]): KeyMatcher => {
  return (event: EventArgs) => {
    return Arr.forall(preds, (pred) => {
      return pred(event);
    });
  };
};

const is = (key: number): KeyMatcher => {
  return (event: EventArgs<KeyboardEvent>) => {
    const raw = event.raw();
    return raw.which === key;
  };
};

const isShift = (event: EventArgs<KeyboardEvent>): boolean => {
  const raw = event.raw();
  return raw.shiftKey === true;
};

const isControl = (event: EventArgs<KeyboardEvent>): boolean => {
  const raw = event.raw();
  return raw.ctrlKey === true;
};

const isNotControl: (event: EventArgs<KeyboardEvent>) => boolean = Fun.not(isControl);
const isNotShift: (event: EventArgs<KeyboardEvent>) => boolean = Fun.not(isShift);

export {
  inSet,
  and,
  is,
  isShift,
  isNotShift,
  isControl,
  isNotControl
};
