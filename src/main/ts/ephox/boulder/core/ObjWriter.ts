import { Arr } from '@ephox/katamari';

var wrap = function (key, value) {
  var r = {};
  r[key] = value;
  return r;
};

var wrapAll = function (keyvalues) {
  var r = {};
  Arr.each(keyvalues, function (kv) {
    r[kv.key] = kv.value;
  });
  return r;
};

export default <any> {
  wrap: wrap,
  wrapAll: wrapAll
};