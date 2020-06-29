import { HTMLTableElement } from '@ephox/dom-globals';
import { Fun, Option, Strings } from '@ephox/katamari';
import { Attr, Body, Css, Element, Height, Node, Traverse, Width } from '@ephox/sugar';
import * as TableLookup from '../api/TableLookup';
import { TableSize } from '../api/TableSize';
import { getSpan } from '../util/CellUtils';
import * as RuntimeSize from './RuntimeSize';

export interface GenericWidth {
  width: () => number;
  unit: () => string;
}

const rGenericSizeRegex = /(\d+(\.\d+)?)(\w|%)*/;
const rPercentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
const rPixelBasedSizeRegex = /(\d+(\.\d+)?)px|em/;

const getPercentSize = (elm: Element, getter: (e: Element) => number) => {
  const relativeParent = Traverse.offsetParent(elm).getOr(Body.getBody(Traverse.owner(elm)));
  return getter(elm) / getter(relativeParent) * 100;
};

export const setPixelWidth = function (cell: Element, amount: number) {
  Css.set(cell, 'width', amount + 'px');
};

export const setPercentageWidth = function (cell: Element, amount: number) {
  Css.set(cell, 'width', amount + '%');
};

export const setHeight = function (cell: Element, amount: number) {
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

const get = function (cell: Element, type: 'rowspan' | 'colspan', f: (e: Element) => number) {
  const v = f(cell);
  const span = getSpan(cell, type);
  return v / span;
};

export const getRawWidth = function (element: Element) {
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
  const percentMatch = rPercentageBasedSizeRegex.exec(width);
  if (percentMatch !== null) {
    return parseFloat(percentMatch[1]);
  } else {
    const intWidth = RuntimeSize.getWidth(element);
    return normalizePercentageWidth(intWidth, tableSize);
  }
};

// Get a percentage size for a percentage parent table
export const getPercentageWidth = function (cell: Element, tableSize: TableSize) {
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
  const pixelMatch = rPixelBasedSizeRegex.exec(width);
  if (pixelMatch !== null) {
    return parseInt(pixelMatch[1], 10);
  }
  const percentMatch = rPercentageBasedSizeRegex.exec(width);
  if (percentMatch !== null) {
    const floatWidth = parseFloat(percentMatch[1]);
    return normalizePixelWidth(floatWidth, tableSize);
  }
  return RuntimeSize.getWidth(element);
};

export const getPixelWidth = function (cell: Element, tableSize: TableSize): number {
  const width = getRawWidth(cell);
  return width.fold(function () {
    return RuntimeSize.getWidth(cell);
  }, function (w) {
    return choosePixelSize(cell, w, tableSize);
  });
};

export const getHeight = function (cell: Element) {
  return get(cell, 'rowspan', getTotalHeight);
};

export const getGenericWidth = function (cell: Element): Option<GenericWidth> {
  const width = getRawWidth(cell);
  return width.bind(function (w) {
    const match = rGenericSizeRegex.exec(w);
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

export const setGenericWidth = function (cell: Element, amount: number, unit: string) {
  Css.set(cell, 'width', amount + unit);
};

export const getPixelTableWidth = (table: Element<HTMLTableElement>): string => Width.get(table) + 'px';
export const getPixelTableHeight = (table: Element<HTMLTableElement>): string => Height.get(table) + 'px';

export const getPercentTableWidth = (table: Element<HTMLTableElement>): string => getPercentSize(table, Width.get) + '%';
export const getPercentTableHeight = (table: Element<HTMLTableElement>): string => getPercentSize(table, Height.get) + '%';

export const isPercentSizing = (table: Element<HTMLTableElement>) => getRawWidth(table).exists((size) => rPercentageBasedSizeRegex.test(size));
export const isPixelSizing = (table: Element<HTMLTableElement>) => getRawWidth(table).exists((size) => rPixelBasedSizeRegex.test(size));
export const isNoneSizing = (table: Element<HTMLTableElement>) => getRawWidth(table).isNone();

export const percentageBasedSizeRegex = Fun.constant(rPercentageBasedSizeRegex);
export const pixelBasedSizeRegex = Fun.constant(rPixelBasedSizeRegex);
