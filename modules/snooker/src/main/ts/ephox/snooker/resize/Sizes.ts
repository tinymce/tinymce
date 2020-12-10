import { Fun, Optional, Strings } from '@ephox/katamari';
import { Attribute, Css, Dimension, Height, SugarBody, SugarElement, SugarNode, Traverse, Width } from '@ephox/sugar';
import * as TableLookup from '../api/TableLookup';
import { TableSize } from '../api/TableSize';
import { getSpan } from '../util/CellUtils';
import * as RuntimeSize from './RuntimeSize';

const rPercentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
const rPixelBasedSizeRegex = /(\d+(\.\d+)?)px|em/;

const getPercentSize = (elm: SugarElement, getter: (e: SugarElement) => number): number => {
  const relativeParent = Traverse.offsetParent(elm).getOr(SugarBody.getBody(Traverse.owner(elm)));
  return getter(elm) / getter(relativeParent) * 100;
};

export const setPixelWidth = (cell: SugarElement, amount: number): void => {
  Css.set(cell, 'width', amount + 'px');
};

export const setPercentageWidth = (cell: SugarElement, amount: number): void => {
  Css.set(cell, 'width', amount + '%');
};

export const setHeight = (cell: SugarElement, amount: number): void => {
  Css.set(cell, 'height', amount + 'px');
};

const getHeightValue = (cell: SugarElement): string => {
  return Css.getRaw(cell, 'height').getOrThunk(() => {
    return RuntimeSize.getHeight(cell) + 'px';
  });
};

const convert = (cell: SugarElement, number: number, getter: (e: SugarElement) => number, setter: (e: SugarElement, value: number) => void): number => {
  const newSize = TableLookup.table(cell).map((table) => {
    const total = getter(table);
    return Math.floor((number / 100.0) * total);
  }).getOr(number);
  setter(cell, newSize);
  return newSize;
};

const normalizePixelSize = (value: string, cell: SugarElement, getter: (e: SugarElement) => number, setter: (e: SugarElement, value: number) => void): number => {
  const number = parseInt(value, 10);
  return Strings.endsWith(value, '%') && SugarNode.name(cell) !== 'table' ? convert(cell, number, getter, setter) : number;
};

const getTotalHeight = (cell: SugarElement): number => {
  const value = getHeightValue(cell);
  if (!value) {
    return Height.get(cell);
  }
  return normalizePixelSize(value, cell, Height.get, setHeight);
};

const get = (cell: SugarElement, type: 'rowspan' | 'colspan', f: (e: SugarElement) => number): number => {
  const v = f(cell);
  const span = getSpan(cell, type);
  return v / span;
};

export const getRawWidth = (element: SugarElement): Optional<string> => {
  // Try to use the style width first, otherwise attempt to get attribute width
  const cssWidth = Css.getRaw(element, 'width');
  return cssWidth.fold(() => {
    return Optional.from(Attribute.get(element, 'width'));
  }, (width) => {
    return Optional.some(width);
  });
};

const normalizePercentageWidth = (cellWidth: number, tableSize: TableSize): number => {
  return cellWidth / tableSize.pixelWidth() * 100;
};

const choosePercentageSize = (element: SugarElement, width: string, tableSize: TableSize): number => {
  const percentMatch = rPercentageBasedSizeRegex.exec(width);
  if (percentMatch !== null) {
    return parseFloat(percentMatch[1]);
  } else {
    const intWidth = RuntimeSize.getWidth(element);
    return normalizePercentageWidth(intWidth, tableSize);
  }
};

// Get a percentage size for a percentage parent table
export const getPercentageWidth = (cell: SugarElement, tableSize: TableSize): number => {
  const width = getRawWidth(cell);
  return width.fold(() => {
    const intWidth = Width.get(cell);
    return normalizePercentageWidth(intWidth, tableSize);
  }, (w) => {
    return choosePercentageSize(cell, w, tableSize);
  });
};

const normalizePixelWidth = (cellWidth: number, tableSize: TableSize): number => {
  return cellWidth / 100 * tableSize.pixelWidth();
};

const choosePixelSize = (element: SugarElement, width: string, tableSize: TableSize): number => {
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

export const getPixelWidth = (cell: SugarElement, tableSize: TableSize): number => {
  const width = getRawWidth(cell);
  return width.fold(() => {
    return RuntimeSize.getWidth(cell);
  }, (w) => {
    return choosePixelSize(cell, w, tableSize);
  });
};

export const getHeight = (cell: SugarElement): number => {
  return get(cell, 'rowspan', getTotalHeight);
};

export const getGenericWidth = (cell: SugarElement): Optional<Dimension.Dimension<'fixed' | 'relative' | 'empty'>> => {
  const width = getRawWidth(cell);
  return width.bind((w) => Dimension.parse(w, [ 'fixed', 'relative', 'empty' ]));
};

export const setGenericWidth = (cell: SugarElement, amount: number, unit: string): void => {
  Css.set(cell, 'width', amount + unit);
};

export const getPixelTableWidth = (table: SugarElement<HTMLTableElement>): string => Width.get(table) + 'px';
export const getPixelTableHeight = (table: SugarElement<HTMLTableElement>): string => Height.get(table) + 'px';

export const getPercentTableWidth = (table: SugarElement<HTMLTableElement>): string => getPercentSize(table, Width.get) + '%';
export const getPercentTableHeight = (table: SugarElement<HTMLTableElement>): string => getPercentSize(table, Height.get) + '%';

export const isPercentSizing = (table: SugarElement<HTMLTableElement>): boolean => getRawWidth(table).exists((size) => rPercentageBasedSizeRegex.test(size));
export const isPixelSizing = (table: SugarElement<HTMLTableElement>): boolean => getRawWidth(table).exists((size) => rPixelBasedSizeRegex.test(size));
export const isNoneSizing = (table: SugarElement<HTMLTableElement>): boolean => getRawWidth(table).isNone();

export const percentageBasedSizeRegex = Fun.constant(rPercentageBasedSizeRegex);
export const pixelBasedSizeRegex = Fun.constant(rPixelBasedSizeRegex);
