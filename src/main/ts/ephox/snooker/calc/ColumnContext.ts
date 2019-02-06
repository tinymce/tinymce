var none = function () {
  return folder(function (n, o, l, m, r) {
    return n();
  });
};

var only = function (index) {
  return folder(function (n, o, l, m, r) {
    return o(index);
  });
};

var left = function (index, next) {
  return folder(function (n, o, l, m, r) {
    return l(index, next);
  });
};

var middle = function (prev, index, next) {
  return folder(function (n, o, l, m, r) {
    return m(prev, index, next);
  });
};

var right = function (prev, index) {
  return folder(function (n, o, l, m, r) {
    return r(prev, index);
  });
};

var folder = function (fold) {
  return {
    fold: fold
  };
};

export default {
  none: none,
  only: only,
  left: left,
  middle: middle,
  right: right
};