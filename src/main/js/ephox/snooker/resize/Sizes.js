define(
  'ephox.snooker.resize.Sizes',

  [
    'ephox.snooker.api.TableLookup',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Width',
    'ephox.violin.Strings',
    'global!Math',
    'global!parseInt'
  ],

  function (TableLookup, Attr, Css, Node, Width, Strings, Math, parseInt) {
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
        var total = Width.get(table);
        return Math.floor((number / 100.0) * total);
      }).getOr(number);
      setWidth(cell, newWidth);
      return newWidth;
    };

    var getTotalWidth = function (cell) {
      var value = getWidthValue(cell);
      // Note, Firefox doesn't calculate the width for you with Css.get
      if (!value) return Width.get(cell);
      var number = parseInt(value, 10);
      return Strings.endsWith(value, '%') && Node.name(cell) !== 'table' ? convert(cell, number) : number;
    };

    var getWidth = function (cell) {
      var w = getTotalWidth(cell);
      var span = Attr.has(cell, 'colspan') ? parseInt(Attr.get(cell, 'colspan'), 10) : 1;
      console.log('w/span', w/span);
      return w / span;
    };

    return {
      setWidth: setWidth,
      getWidth: getWidth
    };
  }
);
