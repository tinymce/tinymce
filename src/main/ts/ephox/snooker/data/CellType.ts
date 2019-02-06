const none = function () {
  return cellType(function (n, w, p) {
    return n();
  });
};

const whole = function (info) {
  return cellType(function (n, w, p) {
    return w(info);
  });
};

const partial = function (info, offset) {
  return cellType(function (n, w, p) {
    return p(info, offset);
  });
};

const cellType = function (fold) {
  return {
    fold
  };
};

export default {
  none,
  whole,
  partial
};