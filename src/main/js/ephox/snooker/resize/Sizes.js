define(
  'ephox.snooker.resize.Sizes',

  [
    'ephox.snooker.api.TableLookup',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Width',
    'ephox.violin.Strings',
    'global!Math',
    'global!parseInt'
  ],

  function (TableLookup, Attr, Css, Height, Node, Width, Strings, Math, parseInt) {
    var setWidth = function (cell, amount) {
      Css.set(cell, 'width', amount + 'px');
    };

    var setHeight = function (cell, amount) {
      Css.set(cell, 'height', amount + 'px');
    };

    var getValue = function (cell, property) {
      var value = cell.dom().style.getPropertyValue(property);
      if (value !== null && value !== undefined) return value;
      else {
        var res = Css.get(cell, property);
        console.log('cell CLONENODE',cell.dom().cloneNode(true));
        console.log('cell.dom()',cell.dom());
        var xxxx = Height.getOuter(cell);
        console.log('xxxx',xxxx);
        console.log('res',res);
        return res;
      }
    };

    var getWidthValue = function (cell) {
      return getValue(cell, 'width');
    };

    var getHeightValue = function (cell) {
      return getValue(cell, 'height');
    };

    var convert = function (cell, number, setter) {
      var newWidth = TableLookup.table(cell).map(function (table) {
        var total = Width.get(table);
        return Math.floor((number / 100.0) * total);
      }).getOr(number);
      setter(cell, newWidth);
      return newWidth;
    };

    var normalizeSize = function (value, cell, setter) {
      var number = parseInt(value, 10);
      return Strings.endsWith(value, '%') && Node.name(cell) !== 'table' ? convert(cell, number, setter) : number;
    };

    var getTotalWidth = function (cell) {
      var value = getWidthValue(cell);
      // Note, Firefox doesn't calculate the width for you with Css.get
      if (!value) return Width.get(cell);
      return normalizeSize(value, cell, setWidth);
    };

    var getTotalHeight = function (cell) {
      var value = getHeightValue(cell);
      if (!value) return Height.get(cell);
      return normalizeSize(value, cell, setHeight);
    };

    var get = function (cell, type, f) {
      var v = f(cell);
      var span = getSpan(cell, type);
      return v / span;
    };

    var getSpan = function (cell, type) {
      return Attr.has(cell, type) ? parseInt(Attr.get(cell, type), 10) : 1;
    };

    var getWidth = function (cell) {
      return get(cell, 'colspan', getTotalWidth);
    };

    var getHeight = function (cell) {
      return get(cell, 'rowspan', getTotalHeight);
    };

    return {
      setWidth: setWidth,
      setHeight: setHeight,
      getWidth: getWidth,
      getHeight: getHeight
    };
  }
);
