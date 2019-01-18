import { Fun } from '@ephox/katamari';

var none = function () {
  return folder(function (n, s, m, e) {
    return n();
  }, 'none');
};

var start = function (element) {
  return folder(function (n, s, m, e) {
    return s(element);
  }, 'start');
};

var middle = function (before, after) {
  return folder(function (n, s, m, e) {
    return m(before, after);
  }, 'middle');
};

var end = function (element) {
  return folder(function (n, s, m, e) {
    return e(element);
  }, 'end');
};

var folder = function (fold, label) {
  return {
    fold: fold,
    label: Fun.constant(label)
  };
};

export default {
  none: none,
  start: start,
  middle: middle,
  end: end
};