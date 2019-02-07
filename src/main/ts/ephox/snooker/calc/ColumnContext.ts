const none = function () {
  return folder(function (n, o, l, m, r) {
    return n();
  });
};

const only = function (index) {
  return folder(function (n, o, l, m, r) {
    return o(index);
  });
};

const left = function (index, next) {
  return folder(function (n, o, l, m, r) {
    return l(index, next);
  });
};

const middle = function (prev, index, next) {
  return folder(function (n, o, l, m, r) {
    return m(prev, index, next);
  });
};

const right = function (prev, index) {
  return folder(function (n, o, l, m, r) {
    return r(prev, index);
  });
};

const folder = function (fold) {
  return {
    fold
  };
};

export default {
  none,
  only,
  left,
  middle,
  right
};