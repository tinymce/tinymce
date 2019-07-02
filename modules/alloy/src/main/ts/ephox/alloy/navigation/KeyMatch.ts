import { KeyboardEvent } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';

import { SugarEvent } from '../alien/TypeDefinitions';

export type KeyMatcher = (evt: SugarEvent) => boolean;

const inSet = (keys: number[]): KeyMatcher => {
  return (event: SugarEvent) => {
    const raw = event.raw() as KeyboardEvent;
    return Arr.contains(keys, raw.which);
  };
};

const and = (preds: KeyMatcher[]): KeyMatcher => {
  return (event: SugarEvent) => {
    return Arr.forall(preds, (pred) => {
      return pred(event);
    });
  };
};

const is = (key: number): KeyMatcher => {
  return (event: SugarEvent) => {
    const raw = event.raw() as KeyboardEvent;
    return raw.which === key;
  };
};

const isShift = (event: SugarEvent): boolean => {
  const raw = event.raw() as KeyboardEvent;
  return raw.shiftKey === true;
};

const isControl = (event: SugarEvent): boolean => {
  const raw = event.raw() as KeyboardEvent;
  return raw.ctrlKey === true;
};

const isNotControl: (event: SugarEvent) => boolean = Fun.not(isControl);
const isNotShift: (event: SugarEvent) => boolean = Fun.not(isShift);

export {
  inSet,
  and,
  is,
  isShift,
  isNotShift,
  isControl,
  isNotControl
};
