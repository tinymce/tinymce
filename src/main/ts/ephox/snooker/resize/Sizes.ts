import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Strings } from '@ephox/katamari';
import TableLookup from '../api/TableLookup';
import RuntimeSize from './RuntimeSize';
import { Node } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { Height } from '@ephox/sugar';
import { Width } from '@ephox/sugar';

var genericSizeRegex = /(\d+(\.\d+)?)(\w|%)*/;
var percentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
var pixelBasedSizeRegex = /(\d+(\.\d+)?)px|em/;

var setPixelWidth = function (cell, amount) {
  Css.set(cell, 'width', amount + 'px');
};

var setPercentageWidth = function (cell, amount) {
  Css.set(cell, 'width', amount + '%');
};

var setHeight = function (cell, amount) {
  Css.set(cell, 'height', amount + 'px');
};

var getHeightValue = function (cell) {
  return Css.getRaw(cell, 'height').getOrThunk(function () {
    return RuntimeSize.getHeight(cell) + 'px';
  });
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
    return parseFloat(percentMatch[1]);
  } else {
    var intWidth = Width.get(element);
    return normalizePercentageWidth(intWidth, tableSize);
  }
};

// Get a percentage size for a percentage parent table
var getPercentageWidth = function (cell, tableSize) {
  var width = getRawWidth(cell);
  return width.fold(function () {
    var intWidth = Width.get(cell);
    return normalizePercentageWidth(intWidth, tableSize);
  }, function (width) {
    return choosePercentageSize(cell, width, tableSize);
  });
};

var normalizePixelWidth = function (cellWidth, tableSize) {
  return cellWidth / 100 * tableSize.pixelWidth();
};

var choosePixelSize = function (element, width, tableSize) {
  if (pixelBasedSizeRegex.test(width)) {
    var pixelMatch = pixelBasedSizeRegex.exec(width);
    return parseInt(pixelMatch[1], 10);
  } else if (percentageBasedSizeRegex.test(width)) {
    var percentMatch = percentageBasedSizeRegex.exec(width);
    var floatWidth = parseFloat(percentMatch[1]);
    return normalizePixelWidth(floatWidth, tableSize);
  } else {
    return Width.get(element)
  }
};

var getPixelWidth = function (cell, tableSize) {
  var width = getRawWidth(cell);
  return width.fold(function () {
    return Width.get(cell);
  }, function (width) {
    return choosePixelSize(cell, width, tableSize);
  });
};

var getHeight = function (cell) {
  return get(cell, 'rowspan', getTotalHeight);
};

var getGenericWidth = function (cell) {
  var width = getRawWidth(cell);
  return width.bind(function (width) {
    if (genericSizeRegex.test(width)) {
      var match = genericSizeRegex.exec(width);
      return Option.some({
        width: Fun.constant(match[1]),
        unit: Fun.constant(match[3])
      });
    } else {
      return Option.none();
    }
  });
};

var setGenericWidth = function (cell, amount, unit) {
  Css.set(cell, 'width', amount + unit);
};

export default {
  percentageBasedSizeRegex: Fun.constant(percentageBasedSizeRegex),
  pixelBasedSizeRegex: Fun.constant(pixelBasedSizeRegex),
  setPixelWidth: setPixelWidth,
  setPercentageWidth: setPercentageWidth,
  setHeight: setHeight,
  getPixelWidth: getPixelWidth,
  getPercentageWidth: getPercentageWidth,
  getGenericWidth: getGenericWidth,
  setGenericWidth: setGenericWidth,
  getHeight: getHeight,
  getRawWidth: getRawWidth
};