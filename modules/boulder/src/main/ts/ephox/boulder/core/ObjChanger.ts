import { Arr, Obj } from '@ephox/katamari';

const narrow = function (obj, fields) {
  const r = { };
  Arr.each(fields, function (field) {
    // TODO: Investigate if the undefined check is relied upon by something
    if (obj[field] !== undefined && Obj.has(obj, field)) { r[field] = obj[field]; }
  });

  return r;
};

const indexOnKey = function (array, key) {
  const obj = { };
  Arr.each(array, function (a) {
    // FIX: Work out what to do here.
    const keyValue = a[key];
    obj[keyValue] = a;
  });
  return obj;
};

const exclude = function (obj, fields) {
  const r = { };
  Obj.each(obj, function (v, k) {
    if (! Arr.contains(fields, k)) {
      r[k] = v;
    }
  });
  return r;
};

export {
  narrow,
  exclude,
  indexOnKey
};