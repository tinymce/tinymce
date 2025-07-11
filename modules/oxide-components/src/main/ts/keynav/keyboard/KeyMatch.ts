import { Arr } from '@ephox/katamari';

export type KeyMatcher = (evt: KeyboardEvent) => boolean;

const inSet = (keys: ReadonlyArray<number>): KeyMatcher => (event: KeyboardEvent) => {
  return Arr.contains(keys, event.which);
};

const and = (preds: KeyMatcher[]): KeyMatcher => (event: KeyboardEvent) => Arr.forall(preds, (pred) => pred(event));

const is = (key: number): KeyMatcher => (event: KeyboardEvent) => {
  // TODO: 'which' is deprecated and ie is not longer supported
  // should `key` be used instead?
  return event.which === key;
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
