define(
  'ephox.snooker.api.CellLocation',

  [
  ],

  function () {
    var none = function (current) {
      return folder(function (n, m, l) {
        return n(current);
      });
    };

    var middle = function (current, target) {
      return folder(function (n, m, l) {
        return m(current, target);
      });
    };

    var last = function (current) {
      return folder(function (n, m, l) {
        return l(current);
      });
    };

    var folder = function (fold) {
      return {
        fold: fold
      };
    };

    return {
      none: none,
      middle: middle,
      last: last
    };
  }
);
