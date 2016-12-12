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
      return Css.getRaw(cell, property).getOrThunk(function () {
        return Css.get(cell, property);
      });
    };

    var getWidthValue = function (cell) {
      return getValue(cell, 'width');
    };

    var getHeightValue = function (cell) {
      return getValue(cell, 'height');
    };

    var convert = function (cell, number, getter, setter) {
      var newSize = TableLookup.table(cell).map(function (table) {
        var total = getter(table);
        return Math.floor((number / 100.0) * total);
      }).getOr(number);
      setter(cell, newSize);
      return newSize;
    };

    var normalizeSize = function (value, cell, getter, setter) {
      var number = parseInt(value, 10);
      return Strings.endsWith(value, '%') && Node.name(cell) !== 'table' ? convert(cell, number, getter, setter) : number;
    };

    var getTotalWidth = function (cell) {
      var value = getWidthValue(cell);
      // Note, Firefox doesn't calculate the width for you with Css.get
      if (!value) return Width.get(cell);
      return normalizeSize(value, cell, Width.get, setWidth);
    };

    var getTotalHeight = function (cell) {
      var value = getHeightValue(cell);
      if (!value) return Height.get(cell);
      return normalizeSize(value, cell, Height.get, setHeight);
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
