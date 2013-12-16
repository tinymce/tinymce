define(
  'ephox.snooker.resize.Sizes',

  [
    'ephox.sugar.api.Css'
  ],

  function (Css) {
    var setWidth = function (cell, amount) {
      cell.dom().style.setProperty('width', amount + 'px');

    };

    var getWidth = function (cell) {
      var value = cell.dom().style.getPropertyValue('width');
      if (value !== null && value !== undefined) return parseInt(value, 10);
      else return parseInt(Css.get(cell, 'width'), 10);
    };

    return {
      setWidth: setWidth,
      getWidth: getWidth
    };
  }
);
