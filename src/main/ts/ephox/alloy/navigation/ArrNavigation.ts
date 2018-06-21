import { Arr, Option } from '@ephox/katamari';

export type ArrCycle<A> = (values: A[], index: number, predicate: (a: A) => boolean) => Option<A>;

const cyclePrev = <A>(values: A[], index: number, predicate: (a: A) => boolean): Option<A> => {
  const before = Arr.reverse(values.slice(0, index));
  const after = Arr.reverse(values.slice(index + 1));
  return Arr.find(before.concat(after), predicate);
};

const tryPrev = <A>(values: A[], index: number, predicate: (a: A) => boolean): Option<A> => {
  const before = Arr.reverse(values.slice(0, index));
  return Arr.find(before, predicate);
};

const cycleNext = <A>(values: A[], index: number, predicate: (a: A) => boolean): Option<A> => {
  const before = values.slice(0, index);
  const after = values.slice(index + 1);
  return Arr.find(after.concat(before), predicate);
};

const tryNext = <A>(values: A[], index: number, predicate: (a: A) => boolean): Option<A> => {
  const after = values.slice(index + 1);
  return Arr.find(after, predicate);
};

export {
  cyclePrev,
  cycleNext,
  tryPrev,
  tryNext
};