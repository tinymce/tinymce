import { Option } from './Option';

// There are many variations of Object iteration that are faster than the 'for-in' style:
// http://jsperf.com/object-keys-iteration/107
//
// Use the native keys if it is available (IE9+), otherwise fall back to manually filtering
export const keys = (function () {
  const fastKeys = Object.keys;

  // This technically means that 'each' and 'find' on IE8 iterate through the object twice.
  // This code doesn't run on IE8 much, so it's an acceptable tradeoff.
  // If it becomes a problem we can always duplicate the feature detection inside each and find as well.
  const slowKeys = function (o: {}) {
    const r: string[] = [];
    for (const i in o) {
      if (o.hasOwnProperty(i)) {
        r.push(i);
      }
    }
    return r;
  };

  return fastKeys === undefined ? slowKeys : fastKeys;
})();


export const each = function <T> (obj: T, f: (value: any, key: string, obj: T) => void) {
  const props = keys(obj);
  for (let k = 0, len = props.length; k < len; k++) {
    const i = props[k];
    const x = obj[i];
    f(x, i, obj);
  }
};

/** map :: (JsObj(k, v), (v, k, JsObj(k, v) -> x)) -> JsObj(k, x) */
export const map = function <R, T> (obj: T, f: (value: any, key: string, obj: T) => any) {
  return tupleMap<R, T>(obj, function (x, i, obj) {
    return {
      k: i,
      v: f(x, i, obj)
    };
  });
};

/** tupleMap :: (JsObj(k, v), (v, k, JsObj(k, v) -> { k: x, v: y })) -> JsObj(x, y) */
export const tupleMap = function <R, T> (obj: T, f: (value: any, key: string, obj: T) => {k: string, v: any}) : R {
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
export const mapToArray = function <T> (obj: {}, f: (value: any, key: string) => T) {
  const r: T[] = [];
  each(obj, function(value, name) {
    r.push(f(value, name));
  });
  return r;
};

/** find :: (JsObj(k, v), (v, k, JsObj(k, v) -> Bool)) -> Option v */
export const find = function <V, T extends Record<string,V>> (obj: T, pred: (value: V, key: string, obj: T) => boolean): Option<V> {
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
export const values = function <V> (obj: Record<string,V> | V[] | {}) {
  return mapToArray(obj, function (v: V) {
    return v;
  });
};

export const size = function (obj: {}) {
  return keys(obj).length;
};
