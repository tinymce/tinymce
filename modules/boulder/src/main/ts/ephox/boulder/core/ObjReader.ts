import { Option, Obj } from '@ephox/katamari';

const readOpt = function (key) {
  return function (obj) {
    return Obj.has(obj, key) ? Option.from(obj[key]) : Option.none();
  };
};

const readOr = function (key, fallback) {
  return function (obj) {
    return Obj.has(obj, key) ? obj[key] : fallback;
  };
};

const readOptFrom = <O>(obj, key): Option<O> => {
  return readOpt(key)(obj);
};

const hasKey = function (obj, key) {
  return Obj.has(obj, key) && obj[key] !== undefined && obj[key] !== null;
};

export {
  readOpt,
  readOr,
  readOptFrom,
  hasKey
};