define(
  'ephox.snooker.calc.ColumnContext',

  [
  ],

  function () {
    var none = function () {
      return folder(function (n, o, l, m, r) {
        return n();
      });
    };

    var only = function () {
      return folder(function (n, o, l, m, r) {
        return o();
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

    return {
      none: none,
      only: only,
      left: left,
      middle: middle,
      right: right
    };
  }
);
