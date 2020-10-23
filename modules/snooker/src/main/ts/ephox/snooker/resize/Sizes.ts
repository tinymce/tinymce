import { Fun, Optional, Strings } from '@ephox/katamari';
import { Attribute, Css, Dimension, Height, SugarBody, SugarElement, SugarNode, Traverse, Width } from '@ephox/sugar';
import * as TableLookup from '../api/TableLookup';
import { TableSize } from '../api/TableSize';
import { getSpan } from '../util/CellUtils';
import * as RuntimeSize from './RuntimeSize';

const rPercentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
const rPixelBasedSizeRegex = /(\d+(\.\d+)?)px|em/;

const getPercentSize = (elm: SugarElement, getter: (e: SugarElement) => number) => {
  const relativeParent = Traverse.offsetParent(elm).getOr(SugarBody.getBody(Traverse.owner(elm)));
  return getter(elm) / getter(relativeParent) * 100;
};

export const setPixelWidth = function (cell: SugarElement, amount: number) {
  Css.set(cell, 'width', amount + 'px');
};

export const setPercentageWidth = function (cell: SugarElement, amount: number) {
  Css.set(cell, 'width', amount + '%');
};

export const setHeight = function (cell: SugarElement, amount: number) {
  Css.set(cell, 'height', amount + 'px');
};

const getHeightValue = function (cell: SugarElement) {
  return Css.getRaw(cell, 'height').getOrThunk(function () {
    return RuntimeSize.getHeight(cell) + 'px';
  });
};

const convert = function (cell: SugarElement, number: number, getter: (e: SugarElement) => number, setter: (e: SugarElement, value: number) => void) {
  const newSize = TableLookup.table(cell).map(function (table) {
    const total = getter(table);
    return Math.floor((number / 100.0) * total);
  }).getOr(number);
  setter(cell, newSize);
  return newSize;
};

const normalizePixelSize = function (value: string, cell: SugarElement, getter: (e: SugarElement) => number, setter: (e: SugarElement, value: number) => void) {
  const number = parseInt(value, 10);
  return Strings.endsWith(value, '%') && SugarNode.name(cell) !== 'table' ? convert(cell, number, getter, setter) : number;
};

const getTotalHeight = function (cell: SugarElement) {
  const value = getHeightValue(cell);
  if (!value) {
    return Height.get(cell);
  }
  return normalizePixelSize(value, cell, Height.get, setHeight);
};

const get = function (cell: SugarElement, type: 'rowspan' | 'colspan', f: (e: SugarElement) => number) {
  const v = f(cell);
  const span = getSpan(cell, type);
  return v / span;
};

export const getRawWidth = function (element: SugarElement) {
  // Try to use the style width first, otherwise attempt to get attribute width
  const cssWidth = Css.getRaw(element, 'width');
  return cssWidth.fold(function () {
    return Optional.from(Attribute.get(element, 'width'));
  }, function (width) {
    return Optional.some(width);
  });
};

const normalizePercentageWidth = function (cellWidth: number, tableSize: TableSize) {
  return cellWidth / tableSize.pixelWidth() * 100;
};

const choosePercentageSize = function (element: SugarElement, width: string, tableSize: TableSize) {
  const percentMatch = rPercentageBasedSizeRegex.exec(width);
  if (percentMatch !== null) {
    return parseFloat(percentMatch[1]);
  } else {
    const intWidth = RuntimeSize.getWidth(element);
    return normalizePercentageWidth(intWidth, tableSize);
  }
};

// Get a percentage size for a percentage parent table
export const getPercentageWidth = function (cell: SugarElement, tableSize: TableSize) {
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

const choosePixelSize = function (element: SugarElement, width: string, tableSize: TableSize) {
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

export const getPixelWidth = function (cell: SugarElement, tableSize: TableSize): number {
  const width = getRawWidth(cell);
  return width.fold(function () {
    return RuntimeSize.getWidth(cell);
  }, function (w) {
    return choosePixelSize(cell, w, tableSize);
  });
};

export const getHeight = function (cell: SugarElement) {
  return get(cell, 'rowspan', getTotalHeight);
};

export const getGenericWidth = function (cell: SugarElement): Optional<Dimension.Dimension<'fixed' | 'relative' | 'empty'>> {
  const width = getRawWidth(cell);
  return width.bind((w) => Dimension.parse(w, [ 'fixed', 'relative', 'empty' ]));
};

export const setGenericWidth = function (cell: SugarElement, amount: number, unit: string) {
  Css.set(cell, 'width', amount + unit);
};

export const getPixelTableWidth = (table: SugarElement<HTMLTableElement>): string => Width.get(table) + 'px';
export const getPixelTableHeight = (table: SugarElement<HTMLTableElement>): string => Height.get(table) + 'px';

export const getPercentTableWidth = (table: SugarElement<HTMLTableElement>): string => getPercentSize(table, Width.get) + '%';
export const getPercentTableHeight = (table: SugarElement<HTMLTableElement>): string => getPercentSize(table, Height.get) + '%';

export const isPercentSizing = (table: SugarElement<HTMLTableElement>) => getRawWidth(table).exists((size) => rPercentageBasedSizeRegex.test(size));
export const isPixelSizing = (table: SugarElement<HTMLTableElement>) => getRawWidth(table).exists((size) => rPixelBasedSizeRegex.test(size));
export const isNoneSizing = (table: SugarElement<HTMLTableElement>) => getRawWidth(table).isNone();

export const percentageBasedSizeRegex = Fun.constant(rPercentageBasedSizeRegex);
export const pixelBasedSizeRegex = Fun.constant(rPixelBasedSizeRegex);
