import { Option } from '@ephox/katamari';

const readOpt = function (key) {
  return function (obj) {
    return obj.hasOwnProperty(key) ? Option.from(obj[key]) : Option.none();
  };
};

const readOr = function (key, fallback) {
  return function (obj) {
    return readOpt(key)(obj).getOr(fallback);
  };
};

const readOptFrom = function (obj, key) {
  return readOpt(key)(obj);
};

const hasKey = function (obj, key) {
  return obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null;
};

export default <any> {
  readOpt,
  readOr,
  readOptFrom,
  hasKey
};