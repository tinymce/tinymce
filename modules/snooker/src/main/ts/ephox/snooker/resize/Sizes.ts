import { Fun, Option, Strings } from '@ephox/katamari';
import { Attr, Css, Height, Node, Width, Element } from '@ephox/sugar';
import TableLookup from '../api/TableLookup';
import RuntimeSize from './RuntimeSize';
import { TableSize } from './Types';

export interface GenericWidth {
  width: () => number;
  unit: () => string;
}

const genericSizeRegex = /(\d+(\.\d+)?)(\w|%)*/;
const percentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
const pixelBasedSizeRegex = /(\d+(\.\d+)?)px|em/;

const setPixelWidth = function (cell: Element, amount: number) {
  Css.set(cell, 'width', amount + 'px');
};

const setPercentageWidth = function (cell: Element, amount: number) {
  Css.set(cell, 'width', amount + '%');
};

const setHeight = function (cell: Element, amount: number) {
  Css.set(cell, 'height', amount + 'px');
};

const getHeightValue = function (cell: Element) {
  return Css.getRaw(cell, 'height').getOrThunk(function () {
    return RuntimeSize.getHeight(cell) + 'px';
  });
};

const convert = function (cell: Element, number: number, getter: (e: Element) => number, setter: (e: Element, value: number) => void) {
  const newSize = TableLookup.table(cell).map(function (table) {
    const total = getter(table);
    return Math.floor((number / 100.0) * total);
  }).getOr(number);
  setter(cell, newSize);
  return newSize;
};

const normalizePixelSize = function (value: string, cell: Element, getter: (e: Element) => number, setter: (e: Element, value: number) => void) {
  const number = parseInt(value, 10);
  return Strings.endsWith(value, '%') && Node.name(cell) !== 'table' ? convert(cell, number, getter, setter) : number;
};

const getTotalHeight = function (cell: Element) {
  const value = getHeightValue(cell);
  if (!value) {
    return Height.get(cell);
  }
  return normalizePixelSize(value, cell, Height.get, setHeight);
};

const get = function (cell: Element, type: string, f: (e: Element) => number) {
  const v = f(cell);
  const span = getSpan(cell, type);
  return v / span;
};

const getSpan = function (cell: Element, type: string) {
  return Attr.has(cell, type) ? parseInt(Attr.get(cell, type), 10) : 1;
};

const getRawWidth = function (element: Element) {
  // Try to use the style width first, otherwise attempt to get attribute width
  const cssWidth = Css.getRaw(element, 'width');
  return cssWidth.fold(function () {
    return Option.from(Attr.get(element, 'width'));
  }, function (width) {
    return Option.some(width);
  });
};

const normalizePercentageWidth = function (cellWidth: number, tableSize: TableSize) {
  return cellWidth / tableSize.pixelWidth() * 100;
};

const choosePercentageSize = function (element: Element, width: string, tableSize: TableSize) {
  const percentMatch = percentageBasedSizeRegex.exec(width);
  if (percentMatch !== null) {
    return parseFloat(percentMatch[1]);
  } else {
    const intWidth = Width.get(element);
    return normalizePercentageWidth(intWidth, tableSize);
  }
};

// Get a percentage size for a percentage parent table
const getPercentageWidth = function (cell: Element, tableSize: TableSize) {
  const width = getRawWidth(cell);
  return width.fold(function () {
    const intWidth = Width.get(cell);
    return normalizePercentageWidth(intWidth, tableSize);
  }, function (w) {
    return choosePercentageSize(cell, w, tableSize);
  });
};

const normalizePixelWidth = function (cellWidth: number, tableSize: TableSize) {
  return cellWidth / 100 * tableSize.pixelWidth();
};

const choosePixelSize = function (element: Element, width: string, tableSize: TableSize) {
  const pixelMatch = pixelBasedSizeRegex.exec(width);
  if (pixelMatch !== null) {
    return parseInt(pixelMatch[1], 10);
  }
  const percentMatch = percentageBasedSizeRegex.exec(width);
  if (percentMatch !== null) {
    const floatWidth = parseFloat(percentMatch[1]);
    return normalizePixelWidth(floatWidth, tableSize);
  }
  return Width.get(element);
};

const getPixelWidth = function (cell: Element, tableSize: TableSize) {
  const width = getRawWidth(cell);
  return width.fold(function () {
    return Width.get(cell);
  }, function (w) {
    return choosePixelSize(cell, w, tableSize);
  });
};

const getHeight = function (cell: Element) {
  return get(cell, 'rowspan', getTotalHeight);
};

const getGenericWidth = function (cell: Element): Option<GenericWidth> {
  const width = getRawWidth(cell);
  return width.bind(function (w) {
    const match = genericSizeRegex.exec(w);
    if (match !== null) {
      return Option.some({
        width: Fun.constant(parseFloat(match[1])),
        unit: Fun.constant(match[3])
      });
    } else {
      return Option.none<GenericWidth>();
    }
  });
};

const setGenericWidth = function (cell: Element, amount: number, unit: string) {
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