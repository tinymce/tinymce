define(
  'ephox.snooker.resize.Sizes',

  [
    'ephox.snooker.lookup.TableLookup',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Width',
    'ephox.violin.Strings',
    'global!Math'
  ],

  function (TableLookup, Css, Node, Width, Strings, Math) {
    var setWidth = function (cell, amount) {
      cell.dom().style.setProperty('width', amount + 'px');

    };

    var getWidthValue = function (cell) {
      var value = cell.dom().style.getPropertyValue('width');
      if (value !== null && value !== undefined) return value;
      else return Css.get(cell, 'width');
    };

    var convert = function (cell, number) {
      var newWidth = TableLookup.table(cell).map(function (table) {
        return Math.floor((number / 100.0) * Width.get(table));
      }).getOr(number);
      setWidth(cell, newWidth);
      return newWidth;
    };

    var getWidth = function (cell) {
      var value = getWidthValue(cell);
      var number = parseInt(value, 10);
      return Strings.endsWith(value, '%') && Node.name(cell) !== 'table' ? convert(cell, number) : number;
    };

    return {
      setWidth: setWidth,
      getWidth: getWidth
    };
  }
);
