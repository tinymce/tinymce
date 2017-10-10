define(
  'ephox.snooker.resize.Sizes',

  [
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Strings',
    'ephox.snooker.api.TableLookup',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Width',
    'global!Math',
    'global!parseInt'
  ],

  function (Option, Strings, TableLookup, Node, Attr, Css, Height, Width, Math, parseInt) {

    var percentageBasedSizeRegex = new RegExp(/(\d+(\.\d+)?)%/);
    var pixelBasedSizeRegex = new RegExp(/(\d+(\.\d+)?)px|em/);

    var setPixelWidth = function (cell, amount) {
      Css.set(cell, 'width', amount + 'px');
    };

    var setPercentageWidth = function (cell, amount) {
      Css.set(cell, 'width', amount + '%');
    };

    var setHeight = function (cell, amount) {
      Css.set(cell, 'height', amount + 'px');
    };

    var getValue = function (cell, property) {
      return Css.getRaw(cell, property).getOrThunk(function () {
        return Css.get(cell, property);
      });
    };

    var getWidthPixelValue = function (cell) {
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

    var normalizePixelSize = function (value, cell, getter, setter) {
      var number = parseInt(value, 10);
      return Strings.endsWith(value, '%') && Node.name(cell) !== 'table' ? convert(cell, number, getter, setter) : number;
    };

    var getTotalPixelWidth = function (cell) {
      var value = getWidthPixelValue(cell);
      // Note, Firefox doesn't calculate the width for you with Css.get
      if (!value) return Width.get(cell);
      return normalizePixelSize(value, cell, Width.get, setPixelWidth);
    };

    var getTotalHeight = function (cell) {
      var value = getHeightValue(cell);
      if (!value) return Height.get(cell);
      return normalizePixelSize(value, cell, Height.get, setHeight);
    };

    var get = function (cell, type, f) {
      var v = f(cell);
      var span = getSpan(cell, type);
      return v / span;
    };

    var getSpan = function (cell, type) {
      return Attr.has(cell, type) ? parseInt(Attr.get(cell, type), 10) : 1;
    };

    var getPixelWidth = function (cell) {
      return get(cell, 'colspan', getTotalPixelWidth);
    };

    var getRawWidth = function (element) {
      // Try to use the style width first, otherwise attempt to get attribute width
      var cssWidth = Css.getRaw(element, 'width');
      return cssWidth.fold(function () {
        return Option.from(Attr.get(element, 'width'));
      }, function (width) {
        return Option.some(width);
      });
    };

    var normalizePercentageWidth = function (cellWidth, tableSize) {
      return cellWidth / tableSize.pixelWidth() * 100;
    };

    var choosePercentageSize = function (element, width, tableSize) {
      if (percentageBasedSizeRegex.test(width)) {
        var percentMatch = percentageBasedSizeRegex.exec(width);
        return parseFloat(percentMatch[1], 10);
      } else {
        var fallbackWidth = Width.get(element);
        var intWidth = parseInt(fallbackWidth, 10);
        return normalizePercentageWidth(intWidth, tableSize);
      }
    };
    // Get a percentage size for a percentage parent table
    var getPercentageWidth = function (cell, tableSize) {
      var width = getRawWidth(cell);
      return width.fold(function () {
        var width = Width.get();
        var intWidth = parseInt(width, 10);
        return normalizePercentageWidth(intWidth);
      }, function (width) {
        return choosePercentageSize(cell, width, tableSize);
      });
    };

    var getHeight = function (cell) {
      return get(cell, 'rowspan', getTotalHeight);
    };

    return {
      setPixelWidth: setPixelWidth,
      setPercentageWidth: setPercentageWidth,
      setHeight: setHeight,
      getPixelWidth: getPixelWidth,
      getPercentageWidth: getPercentageWidth,
      getHeight: getHeight,
      getRawWidth: getRawWidth
    };
  }
);
