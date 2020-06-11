import * as Arr from './Arr';
import { Option } from './Option';
import { Eq } from '@ephox/dispute';

type Eq<A> = Eq.Eq<A>;

/** A mutable map whose key only requires an Eq instance. O(n) lookup and insert. */
export interface MutableEqMap<K, V> {
  readonly put: (k: K, v: V) => void;
  readonly get: (k: K) => Option<V>;
}

export const create = <K, V> (eq: Eq<K>): MutableEqMap<K, V> => {
  const guts: Array<{k: K; v: V}> = [];

  const put = (key: K, value: V): void =>
    Arr.findIndex(guts, ({ k }) => eq.eq(k, key))
      .fold(
        () => {
          guts.push({ k: key, v: value });
        },
        (i) => {
          guts[i] = { k: key, v: value };
        }
      );

  const get = (key: K): Option<V> =>
    Arr.find(guts, ({ k }) => eq.eq(k, key)).map(({ v }) => v);

  return {
    put,
    get
  };
};

