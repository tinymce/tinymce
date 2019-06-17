import { Arr } from '@ephox/katamari';

const wrap = function (key, value) {
  const r = {};
  r[key] = value;
  return r;
};

const wrapAll = function (keyvalues) {
  const r = {};
  Arr.each(keyvalues, function (kv) {
    r[kv.key] = kv.value;
  });
  return r;
};

export {
  wrap,
  wrapAll
};