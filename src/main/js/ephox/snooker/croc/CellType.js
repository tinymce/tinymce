define(
  'ephox.snooker.croc.CellType',

  [
  ],

  function () {
    var whole = function (info) {
      return cellType(function (w, p) {
        return w(info);
      });
    };

    var partial = function (info, offset) {
      return cellType(function (w, p) {
        return p(info, offset);
      });
    };

    var cellType = function (fold) {
      return {
        fold: fold
      };
    };

    return {
      whole: whole,
      partial: partial
    };
  }
);
