define(
  'ephox.snooker.ready.data.CellType',

  [
  ],

  function () {
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

    return {
      none: none,
      whole: whole,
      partial: partial
    };
  }
);