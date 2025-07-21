import { Arr } from '@ephox/katamari';

import type { Key } from './Keys';

export type KeyMatcher = (evt: KeyboardEvent) => boolean;

const inSet = (keys: ReadonlyArray<Key>): KeyMatcher => (event: KeyboardEvent) => {
  return Arr.exists(keys, (key) => key.code === event.code || key.key === event.key || key.which === event.which);
};

const and = (preds: KeyMatcher[]): KeyMatcher => (event: KeyboardEvent) => Arr.forall(preds, (pred) => pred(event));

const is = (key: Key): KeyMatcher => (event: KeyboardEvent) => {
  // use key but fallback to which to support @ephox/agar
  return event.key === key.key || event.code === key.code || event.which === key.which;
};

const isShift = (event: KeyboardEvent): boolean => {
  return event.shiftKey === true;
};

const isNotShift = (event: KeyboardEvent): boolean =>
  !isShift(event);

export {
  inSet,
  and,
  is,
  isShift,
  isNotShift
};
