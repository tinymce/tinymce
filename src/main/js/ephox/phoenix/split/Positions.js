define(
  'ephox.phoenix.split.Positions',

  [
    'ephox.phoenix.api.data.SplitPosition'
  ],

  function (SplitPosition) {
    /* 
     * Fill in comment later.
     */
    var determine = function (target) {
      return target.before().fold(function () {
        return target.after().fold(function () {
          return SplitPosition.none();
        }, function (a) {
          return SplitPosition.start(a);
        });
      }, function (b) {
        return target.after().fold(function () {
          return SplitPosition.end(b);
        }, function (a) {
          return SplitPosition.middle(b, a);
        });
      });
    };

    return {
      determine: determine
    };
  }
);
