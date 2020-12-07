import { Arr } from '@ephox/katamari';

const wrap = function <V> (key: string, value: V): { [key: string]: V} {
  return { [key]: value };
};

const wrapAll = function <K extends string | number, T> (keyvalues: Array<{ key: K; value: T }>): Record<K, T> {
  const r = {} as Record<K, T>;
  Arr.each(keyvalues, function (kv) {
    r[kv.key] = kv.value;
  });
  return r;
};

export {
  wrap,
  wrapAll
};
