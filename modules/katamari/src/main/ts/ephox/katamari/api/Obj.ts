import { Option } from './Option';

// There are many variations of Object iteration that are faster than the 'for-in' style:
// http://jsperf.com/object-keys-iteration/107
//
// Use the native keys if it is available (IE9+), otherwise fall back to manually filtering
export const keys = Object.keys;

export const hasOwnProperty = Object.hasOwnProperty;

export const each = function <T> (obj: T, f: (value: T[keyof T], key: string) => void) {
  const props = keys(obj);
  for (let k = 0, len = props.length; k < len; k++) {
    const i = props[k];
    const x = obj[i];
    f(x, i);
  }
};

export const map = function <T, R> (obj: T, f: (value: T[keyof T], key: string) => R) {
  return tupleMap<{[k in keyof T]: R}, T>(obj, (x, i) => ({
    k: i,
    v: f(x, i)
  }));
};

export const tupleMap = function <R, T> (obj: T, f: (value: T[keyof T], key: string) => {k: string, v: any}): R {
  const r: Record<string, any> = {};
  each(obj, function (x, i) {
    const tuple = f(x, i);
    r[tuple.k] = tuple.v;
  });
  return <R> r;
};

export const bifilter = function <V> (obj: Record<string, V>, pred: (value: V, key: string) => boolean) {
  const t: Record<string, V> = {};
  const f: Record<string, V> = {};
  each(obj, function (x, i) {
    const branch = pred(x, i) ? t : f;
    branch[i] = x;
  });
  return { t, f };
};

export const mapToArray = function <T, R> (obj: T, f: (value: T[keyof T], key: string) => R) {
  const r: R[] = [];
  each(obj, function (value, name) {
    r.push(f(value, name));
  });
  return r;
};

export const find = function <T> (obj: T, pred: (value: T[keyof T], key: string, obj: T) => boolean): Option<T[keyof T]> {
  const props = keys(obj);
  for (let k = 0, len = props.length; k < len; k++) {
    const i = props[k];
    const x = obj[i];
    if (pred(x, i, obj)) {
      return Option.some(x);
    }
  }
  return Option.none();
};

export const values = function <T> (obj: T) {
  return mapToArray(obj, function (v) {
    return v;
  });
};

export const size = function (obj: {}) {
  return keys(obj).length;
};

export const get = function <T, K extends keyof T> (obj: T, key: K): Option<NonNullable<T[K]>> {
  return has(obj, key) ? Option.from(obj[key] as NonNullable<T[K]>) : Option.none();
};

export const has = function <T, K extends keyof T> (obj: T, key: K): boolean {
  return hasOwnProperty.call(obj, key);
};

export const isEmpty = (r: Record<any, any>): boolean => {
  for (const x in r) {
    if (hasOwnProperty.call(r, x)) {
      return false;
    }
  }
  return true;
};
