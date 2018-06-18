import { Option } from './Option';

// There are many variations of Object iteration that are faster than the 'for-in' style:
// http://jsperf.com/object-keys-iteration/107
//
// Use the native keys if it is available (IE9+), otherwise fall back to manually filtering
var keys = (function () {
  var fastKeys = Object.keys;

  // This technically means that 'each' and 'find' on IE8 iterate through the object twice.
  // This code doesn't run on IE8 much, so it's an acceptable tradeoff.
  // If it becomes a problem we can always duplicate the feature detection inside each and find as well.
  var slowKeys = function (o: {}) {
    var r: string[] = [];
    for (var i in o) {
      if (o.hasOwnProperty(i)) {
        r.push(i);
      }
    }
    return r;
  };

  return fastKeys === undefined ? slowKeys : fastKeys;
})();


var each = function <T> (obj: T, f: (value: any, key: string, obj: T) => void) {
  var props = keys(obj);
  for (var k = 0, len = props.length; k < len; k++) {
    var i = props[k];
    var x = obj[i];
    f(x, i, obj);
  }
};

/** objectMap :: (JsObj(k, v), (v, k, JsObj(k, v) -> x)) -> JsObj(k, x) */
var objectMap = function <R, T> (obj: T, f: (value: any, key: string, obj: T) => any) {
  return tupleMap<R, T>(obj, function (x, i, obj) {
    return {
      k: i,
      v: f(x, i, obj)
    };
  });
};

/** tupleMap :: (JsObj(k, v), (v, k, JsObj(k, v) -> { k: x, v: y })) -> JsObj(x, y) */
var tupleMap = function <R, T> (obj: T, f: (value: any, key: string, obj: T) => {k: string, v: any}) : R {
  var r: Record<string, any> = {};
  each(obj, function (x, i) {
    var tuple = f(x, i, obj);
    r[tuple.k] = tuple.v;
  });
  return <R>r;
};

/** bifilter :: (JsObj(k, v), (v, k -> Bool)) -> { t: JsObj(k, v), f: JsObj(k, v) } */
var bifilter = function <V> (obj: Record<string,V>, pred: (value: V, key: string) => boolean) {
  var t: Record<string,V> = {};
  var f: Record<string,V> = {};
  each(obj, function(x, i) {
    var branch = pred(x, i) ? t : f;
    branch[i] = x;
  });
  return {
    t: t,
    f: f
  };
};

/** mapToArray :: (JsObj(k, v), (v, k -> a)) -> [a] */
var mapToArray = function <T2> (obj: {}, f: (value: any, key: string) => T2) {
  var r: T2[] = [];
  each(obj, function(value, name) {
    r.push(f(value, name));
  });
  return r;
};

/** find :: (JsObj(k, v), (v, k, JsObj(k, v) -> Bool)) -> Option v */
var find = function <V, T extends Record<string,V>> (obj: T, pred: (value: V, key: string, obj: T) => boolean): Option<V> {
  var props = keys(obj);
  for (var k = 0, len = props.length; k < len; k++) {
    var i = props[k];
    var x = obj[i];
    if (pred(x, i, obj)) {
      return Option.some(x);
    }
  }
  return Option.none();
};

/** values :: JsObj(k, v) -> [v] */
var values = function <V> (obj: Record<string,V> | V[] | {}) {
  return mapToArray(obj, function (v: V) {
    return v;
  });
};

var size = function (obj: {}) {
  return values(obj).length;
};

export default {
  bifilter: bifilter,
  each: each,
  map: objectMap,
  mapToArray: mapToArray,
  tupleMap: tupleMap,
  find: find,
  keys: keys,
  values: values,
  size: size
};