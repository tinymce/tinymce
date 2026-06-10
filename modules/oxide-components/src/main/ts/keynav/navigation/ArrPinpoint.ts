import { Arr, Optional } from '@ephox/katamari';

export interface IndexInfo<A> {
  readonly index: number;
  readonly candidates: A[];
}

export const locate = <A> (candidates: A[], predicate: (a: A) => boolean): Optional<IndexInfo<A>> => Arr.findIndex(candidates, predicate).map((index) => ({
  index,
  candidates
}));
