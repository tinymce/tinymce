import { Arr, Option, Fun } from '@ephox/katamari';

export interface IndexInfo<A> {
  index: () => number;
  candidates: () => A[];
}

export const locate = <A> (candidates: A[], predicate: (a: A) => boolean): Option<IndexInfo<A>> => Arr.findIndex(candidates, predicate).map((index) => ({
  index: Fun.constant(index),
  candidates: Fun.constant(candidates)
}));
