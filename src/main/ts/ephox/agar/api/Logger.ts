import ErrorTypes from '../alien/ErrorTypes';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';

var t = function (label, f) {
  var enrich = function (err) {
    return ErrorTypes.enrichWith(label, err);
  };

  return function (value, next, die) {
    var dieWith = Fun.compose(die, enrich);
    try {
      return f(value, next, dieWith);
    } catch (err) {
      dieWith(err);
    }
  };
};

var sync = function (label, f) {
  var enrich = function (err) {
    return ErrorTypes.enrichWith(label, err);
  };

  try {
    return f();
  } catch (err) {
    throw enrich(err);
  }
};

var ts = function (label, fs) {
  if (fs.length === 0) return fs;
  return Arr.map(fs, function (f, i) {
    return t(label + '(' + i + ')', f);
  });
};

var suite = function () {
  // TMP, WIP
};

var spec = function (msg) {
  // TMP, WIP
  console.log(msg);
};

export default {
  t: t,
  ts: ts,
  sync: sync,
  suite: suite,
  spec: spec
};