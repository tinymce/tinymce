import { Eq } from '@ephox/dispute';

import * as Fun from './Fun';
import { Optional } from './Optional';

// There are many variations of Object iteration that are faster than the 'for-in' style:
// http://jsperf.com/object-keys-iteration/107
//
// Use the native keys if it is available (IE9+), otherwise fall back to manually filtering
export const keys = Object.keys;

// eslint-disable-next-line @typescript-eslint/unbound-method
export const hasOwnProperty = Object.hasOwnProperty;

export const each = <T>(obj: T, f: (value: T[keyof T], key: string) => void): void => {
  const props = keys(obj);
  for (let k = 0, len = props.length; k < len; k++) {
    const i = props[k];
    const x = obj[i];
    f(x, i);
  }
};

export const map = <T, R>(obj: T, f: (value: T[keyof T], key: string) => R): {[k in keyof T]: R} => {
  return tupleMap<{[k in keyof T]: R}, T>(obj, (x, i) => ({
    k: i,
    v: f(x, i)
  }));
};

export const tupleMap = <R, T>(obj: T, f: (value: T[keyof T], key: string) => {k: string; v: any}): R => {
  const r = {} as R;
  each(obj, (x, i) => {
    const tuple = f(x, i);
    r[tuple.k] = tuple.v;
  });
  return r;
};

const objAcc = <K extends number | string | symbol, V>(r: Record<K, V>) => (x: V, i: K): void => {
  r[i] = x;
};

const internalFilter = <V>(obj: Record<string, V>, pred: (value: V, key: string) => boolean, onTrue: (value: V, key: string) => void, onFalse: (value: V, key: string) => void) => {
  const r: Record<string, V> = {};
  each(obj, (x, i) => {
    (pred(x, i) ? onTrue : onFalse)(x, i);
  });
  return r;
};

export const bifilter = <V>(obj: Record<string, V>, pred: (value: V, key: string) => boolean): {t: Record<string, V>; f: Record<string, V>} => {
  const t: Record<string, V> = {};
  const f: Record<string, V> = {};
  internalFilter(obj, pred, objAcc(t), objAcc(f));
  return { t, f };
};

export const filter = <V>(obj: Record<string, V>, pred: (value: V, key: string) => boolean): Record<string, V> => {
  const t: Record<string, V> = {};
  internalFilter(obj, pred, objAcc(t), Fun.noop);
  return t;
};

export const mapToArray = <T, R>(obj: T, f: (value: T[keyof T], key: string) => R): R[] => {
  const r: R[] = [];
  each(obj, (value, name) => {
    r.push(f(value, name));
  });
  return r;
};

export const find = <T>(obj: T, pred: (value: T[keyof T], key: string, obj: T) => boolean): Optional<T[keyof T]> => {
  const props = keys(obj);
  for (let k = 0, len = props.length; k < len; k++) {
    const i = props[k];
    const x = obj[i];
    if (pred(x, i, obj)) {
      return Optional.some(x);
    }
  }
  return Optional.none();
};

export const values = <T>(obj: T): Array<T[keyof T]> => {
  return mapToArray(obj, Fun.identity);
};

export const size = (obj: {}): number => {
  return keys(obj).length;
};

export const get = <T, K extends keyof T>(obj: T, key: K): Optional<NonNullable<T[K]>> => {
  return has(obj, key) ? Optional.from(obj[key] as NonNullable<T[K]>) : Optional.none();
};

export const has = <T, K extends keyof T>(obj: T, key: K): boolean =>
  hasOwnProperty.call(obj, key);

export const hasNonNullableKey = <T, K extends keyof T>(obj: T, key: K): obj is T & Record<K, NonNullable<T[K]>> =>
  has(obj, key) && obj[key] !== undefined && obj[key] !== null;

export const isEmpty = (r: Record<any, any>): boolean => {
  for (const x in r) {
    if (hasOwnProperty.call(r, x)) {
      return false;
    }
  }
  return true;
};

export const equal = <T>(a1: Record<string, T>, a2: Record<string, T>, eq: Eq.Eq<T> = Eq.eqAny): boolean =>
  Eq.eqRecord(eq).eq(a1, a2);
