import { Fun } from '@ephox/katamari';

var before = function (element) {
  return folder(function (b, a, r, l, i) {
    return b(element);
  }, 'before');
};

var after = function (element) {
  return folder(function (b, a, r, l, i) {
    return a(element);
  }, 'after');
};

var rest = function (element) {
  return folder(function (b, a, r, l, i) {
    return r(element);
  }, 'rest');
};

var last = function (parent) {
  return folder(function (b, a, r, l, i) {
    return l(parent);
  }, 'last');
};

var invalid = function (element, offset) {
  return folder(function (b, a, r, l, i) {
    return i(element, offset);
  }, 'invalid');
};

var folder = function (fold, label) {
  return {
    fold: fold,
    label: Fun.constant(label)
  };
};

export default {
  before: before,
  after: after,
  rest: rest,
  last: last,
  invalid: invalid
};