import { Option } from './Option';

// There are many variations of Object iteration that are faster than the 'for-in' style:
// http://jsperf.com/object-keys-iteration/107
//
// Use the native keys if it is available (IE9+), otherwise fall back to manually filtering
export const keys = Object.keys;

export const hasOwnProperty = Object.hasOwnProperty;

export const each = function <T> (obj: T, f: (value: T[keyof T], key: string, obj: T) => void) {
  const props = keys(obj);
  for (let k = 0, len = props.length; k < len; k++) {
    const i = props[k];
    const x = obj[i];
    f(x, i, obj);
  }
};

/** map :: (JsObj(k, v), (v, k, JsObj(k, v) -> x)) -> JsObj(k, x) */
export const map = function <T, R> (obj: T, f: (value: T[keyof T], key: string, obj: T) => R) {
  return tupleMap<{[k in keyof T]: R}, T>(obj, function (x, i, obj) {
    return {
      k: i,
      v: f(x, i, obj)
    };
  });
};

/** tupleMap :: (JsObj(k, v), (v, k, JsObj(k, v) -> { k: x, v: y })) -> JsObj(x, y) */
export const tupleMap = function <R, T> (obj: T, f: (value: T[keyof T], key: string, obj: T) => {k: string, v: any}) : R {
  const r: Record<string, any> = {};
  each(obj, function (x, i) {
    const tuple = f(x, i, obj);
    r[tuple.k] = tuple.v;
  });
  return <R>r;
};

/** bifilter :: (JsObj(k, v), (v, k -> Bool)) -> { t: JsObj(k, v), f: JsObj(k, v) } */
export const bifilter = function <V> (obj: Record<string,V>, pred: (value: V, key: string) => boolean) {
  const t: Record<string,V> = {};
  const f: Record<string,V> = {};
  each(obj, function(x, i) {
    const branch = pred(x, i) ? t : f;
    branch[i] = x;
  });
  return {
    t: t,
    f: f
  };
};

/** mapToArray :: (JsObj(k, v), (v, k -> a)) -> [a] */
export const mapToArray = function <T,R> (obj: T, f: (value: T[keyof T], key: string) => R) {
  const r: R[] = [];
  each(obj, function(value, name) {
    r.push(f(value, name));
  });
  return r;
};

/** find :: (JsObj(k, v), (v, k, JsObj(k, v) -> Bool)) -> Option v */
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

/** values :: JsObj(k, v) -> [v] */
export const values = function <T> (obj: T) {
  return mapToArray(obj, function (v) {
    return v;
  });
};

export const size = function (obj: {}) {
  return keys(obj).length;
};


/** get :: (JsObj(k, v), k) -> Option v */
export const get = function <T, K extends keyof T> (obj: T, key: K): Option<NonNullable<T[K]>> {
  return has(obj, key) ? Option.from(obj[key] as NonNullable<T[K]>) : Option.none();
};

/** has :: (JsObj(k, v), k) -> Bool */
export const has = function <T, K extends keyof T> (obj: T, key: K): boolean {
  return hasOwnProperty.call(obj, key);
};