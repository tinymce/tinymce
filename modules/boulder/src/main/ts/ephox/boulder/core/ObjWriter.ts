import { Arr } from '@ephox/katamari';

const wrap = function <K, V> (key: string, value: V): { [key: string]: V} {
  return { [key]: value };
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
