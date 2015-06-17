define(
  'ephox.snooker.api.Sizes',

  [
    'ephox.snooker.resize.Adjustments',
    'ephox.snooker.resize.Redistribution',
    'ephox.snooker.resize.Sizes',
    'ephox.sugar.api.Width'
  ],

  function (Adjustments, Redistribution, Sizes, Width) {
    var setWidth = function (cell, amount) {
     Sizes.setWidth(cell, amount);
    };

    var getWidth = function (cell) {
      return Sizes.getWidth(cell);
    };

    var redistributeWidth = function (table, newWidth, direction) {
      var totalWidth = Width.get(table);
      var callback = Adjustments.calculateWidths(table, direction);
      callback(function (widths) {
        console.log('widths', widths, 'totalWidth', totalWidth, 'newWidth', newWidth);
        var output = Redistribution.redistribute(widths, totalWidth, newWidth);
        console.log('output', output);
        return output;
      });
    };

    return {
      setWidth: setWidth,
      getWidth: getWidth,
      redistributeWidth: redistributeWidth
    };
  }
);
