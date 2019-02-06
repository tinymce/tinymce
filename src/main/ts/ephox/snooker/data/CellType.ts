var none = function () {
  return cellType(function (n, w, p) {
    return n();
  });
};

var whole = function (info) {
  return cellType(function (n, w, p) {
    return w(info);
  });
};

var partial = function (info, offset) {
  return cellType(function (n, w, p) {
    return p(info, offset);
  });
};

var cellType = function (fold) {
  return {
    fold: fold
  };
};

export default {
  none: none,
  whole: whole,
  partial: partial
};