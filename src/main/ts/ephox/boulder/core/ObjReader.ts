import { Option } from '@ephox/katamari';

var readOpt = function (key) {
  return function (obj) {
    return obj.hasOwnProperty(key) ? Option.from(obj[key]) : Option.none();
  };
};

var readOr = function (key, fallback) {
  return function (obj) {
    return readOpt(key)(obj).getOr(fallback);
  };
};

var readOptFrom = function (obj, key) {
  return readOpt(key)(obj);
};

var hasKey = function (obj, key) {
  return obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null;
};

export default <any> {
  readOpt: readOpt,
  readOr: readOr,
  readOptFrom: readOptFrom,
  hasKey: hasKey
};