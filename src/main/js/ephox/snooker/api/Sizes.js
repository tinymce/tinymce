define(
  'ephox.snooker.api.Sizes',

  [
    'ephox.snooker.resize.Sizes'
  ],

  function (Sizes) {
    var setWidth = function (cell, amount) {
     Sizes.setWidth(cell, amount);
    };

    var getWidth = function (cell) {
      return Sizes.getWidth(cell);
    };

    return {
      setWidth: setWidth,
      getWidth: getWidth
    };
  }
);
