import { Arr } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';

var narrow = function (obj, fields) {
  var r = { };
  Arr.each(fields, function (field) {
    if (obj[field] !== undefined && obj.hasOwnProperty(field)) r[field] = obj[field];
  });

  return r;
};

var indexOnKey = function (array, key) {
  var obj = { };
  Arr.each(array, function (a) {
    // FIX: Work out what to do here.
    var keyValue = a[key];
    obj[keyValue] = a;
  });
  return obj;
};

var exclude = function (obj, fields) {
  var r = { };
  Obj.each(obj, function (v, k) {
    if (! Arr.contains(fields, k)) {
      r[k] = v;
    }
  });
  return r;
};

export default <any> {
  narrow: narrow,
  exclude: exclude,
  indexOnKey: indexOnKey
};