import { Fun, Option, Strings } from '@ephox/katamari';
import { Attr, Css, Height, Node, Width } from '@ephox/sugar';
import TableLookup from '../api/TableLookup';
import RuntimeSize from './RuntimeSize';

const genericSizeRegex = /(\d+(\.\d+)?)(\w|%)*/;
const percentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
const pixelBasedSizeRegex = /(\d+(\.\d+)?)px|em/;

const setPixelWidth = function (cell, amount) {
  Css.set(cell, 'width', amount + 'px');
};

const setPercentageWidth = function (cell, amount) {
  Css.set(cell, 'width', amount + '%');
};

const setHeight = function (cell, amount) {
  Css.set(cell, 'height', amount + 'px');
};

const getHeightValue = function (cell) {
  return Css.getRaw(cell, 'height').getOrThunk(function () {
    return RuntimeSize.getHeight(cell) + 'px';
  });
};

const convert = function (cell, number, getter, setter) {
  const newSize = TableLookup.table(cell).map(function (table) {
    const total = getter(table);
    return Math.floor((number / 100.0) * total);
  }).getOr(number);
  setter(cell, newSize);
  return newSize;
};

const normalizePixelSize = function (value, cell, getter, setter) {
  const number = parseInt(value, 10);
  return Strings.endsWith(value, '%') && Node.name(cell) !== 'table' ? convert(cell, number, getter, setter) : number;
};

const getTotalHeight = function (cell) {
  const value = getHeightValue(cell);
  if (!value) { return Height.get(cell); }
  return normalizePixelSize(value, cell, Height.get, setHeight);
};

const get = function (cell, type, f) {
  const v = f(cell);
  const span = getSpan(cell, type);
  return v / span;
};

const getSpan = function (cell, type) {
  return Attr.has(cell, type) ? parseInt(Attr.get(cell, type), 10) : 1;
};

const getRawWidth = function (element) {
  // Try to use the style width first, otherwise attempt to get attribute width
  const cssWidth = Css.getRaw(element, 'width');
  return cssWidth.fold(function () {
    return Option.from(Attr.get(element, 'width'));
  }, function (width) {
    return Option.some(width);
  });
};

const normalizePercentageWidth = function (cellWidth, tableSize) {
  return cellWidth / tableSize.pixelWidth() * 100;
};

const choosePercentageSize = function (element, width, tableSize) {
  if (percentageBasedSizeRegex.test(width)) {
    const percentMatch = percentageBasedSizeRegex.exec(width);
    return parseFloat(percentMatch[1]);
  } else {
    const intWidth = Width.get(element);
    return normalizePercentageWidth(intWidth, tableSize);
  }
};

// Get a percentage size for a percentage parent table
const getPercentageWidth = function (cell, tableSize) {
  const width = getRawWidth(cell);
  return width.fold(function () {
    const intWidth = Width.get(cell);
    return normalizePercentageWidth(intWidth, tableSize);
  }, function (w) {
    return choosePercentageSize(cell, w, tableSize);
  });
};

const normalizePixelWidth = function (cellWidth, tableSize) {
  return cellWidth / 100 * tableSize.pixelWidth();
};

const choosePixelSize = function (element, width, tableSize) {
  if (pixelBasedSizeRegex.test(width)) {
    const pixelMatch = pixelBasedSizeRegex.exec(width);
    return parseInt(pixelMatch[1], 10);
  } else if (percentageBasedSizeRegex.test(width)) {
    const percentMatch = percentageBasedSizeRegex.exec(width);
    const floatWidth = parseFloat(percentMatch[1]);
    return normalizePixelWidth(floatWidth, tableSize);
  } else {
    return Width.get(element);
  }
};

const getPixelWidth = function (cell, tableSize) {
  const width = getRawWidth(cell);
  return width.fold(function () {
    return Width.get(cell);
  }, function (w) {
    return choosePixelSize(cell, w, tableSize);
  });
};

const getHeight = function (cell) {
  return get(cell, 'rowspan', getTotalHeight);
};

const getGenericWidth = function (cell) {
  const width = getRawWidth(cell);
  return width.bind(function (w) {
    if (genericSizeRegex.test(w)) {
      const match = genericSizeRegex.exec(w);
      return Option.some({
        width: Fun.constant(match[1]),
        unit: Fun.constant(match[3])
      });
    } else {
      return Option.none();
    }
  });
};

const setGenericWidth = function (cell, amount, unit) {
  Css.set(cell, 'width', amount + unit);
};

export default {
  percentageBasedSizeRegex: Fun.constant(percentageBasedSizeRegex),
  pixelBasedSizeRegex: Fun.constant(pixelBasedSizeRegex),
  setPixelWidth,
  setPercentageWidth,
  setHeight,
  getPixelWidth,
  getPercentageWidth,
  getGenericWidth,
  setGenericWidth,
  getHeight,
  getRawWidth
};