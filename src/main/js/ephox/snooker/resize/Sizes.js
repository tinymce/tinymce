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

    var getWidthValue = function (cell) {
      var value = cell.dom().style.getPropertyValue('width');
      if (value !== null && value !== undefined) return value;
      else return Css.get(cell, 'width');
    };

    var getHeightValue = function (cell) {
      var value = cell.dom().style.getPropertyValue('height');
      if (value !== null && value !== undefined) return value;
      else return Css.get(cell, 'height');
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

    var getSpan = function (cell, type) {
      return Attr.has(cell, type) ? parseInt(Attr.get(cell, type), 10) : 1;
    };

    var getWidth = function (cell) {
      var w = getTotalWidth(cell);
      var span = getSpan(cell, 'colspan');
      return w / span;
    };

    var getHeight = function (cell) {
      var h = getTotalHeight(cell);
      var span = getSpan(cell, 'rowspan');
      return h / span;
    };


    return {
      setWidth: setWidth,
      setHeight: setHeight,
      getWidth: getWidth,
      getHeight: getHeight
    };
  }
);
