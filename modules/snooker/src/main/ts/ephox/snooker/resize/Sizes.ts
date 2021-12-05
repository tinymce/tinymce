import { Fun, Optional, Strings } from '@ephox/katamari';
import { Attribute, Css, Dimension, Height, SugarBody, SugarElement, SugarNode, Traverse, Width } from '@ephox/sugar';

import * as TableLookup from '../api/TableLookup';
import { getSpan } from '../util/CellUtils';

type SizeGetter = (e: SugarElement<HTMLElement>) => number;
type SizeSetter = (e: SugarElement<HTMLElement>, value: number) => void;

const rPercentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
const rPixelBasedSizeRegex = /(\d+(\.\d+)?)px|em/;
const isCol = SugarNode.isTag('col');

const getPercentSize = (elm: SugarElement<HTMLElement>, outerGetter: SizeGetter, innerGetter: SizeGetter): number => {
  const relativeParent = Traverse.parentElement(elm).getOrThunk(() => SugarBody.getBody(Traverse.owner(elm)));
  return outerGetter(elm) / innerGetter(relativeParent) * 100;
};

export const setPixelWidth = (cell: SugarElement<HTMLElement>, amount: number): void => {
  Css.set(cell, 'width', amount + 'px');
};

export const setPercentageWidth = (cell: SugarElement<HTMLElement>, amount: number): void => {
  Css.set(cell, 'width', amount + '%');
};

export const setHeight = (cell: SugarElement<HTMLElement>, amount: number): void => {
  Css.set(cell, 'height', amount + 'px');
};

const getHeightValue = (cell: SugarElement<HTMLElement>): string =>
  Height.getRuntime(cell) + 'px';

const convert = (cell: SugarElement<HTMLTableCellElement>, number: number, getter: SizeGetter, setter: SizeSetter): number => {
  const newSize = TableLookup.table(cell).map((table) => {
    const total = getter(table);
    return Math.floor((number / 100.0) * total);
  }).getOr(number);
  setter(cell, newSize);
  return newSize;
};

const normalizePixelSize = (value: string, cell: SugarElement<HTMLTableCellElement>, getter: SizeGetter, setter: SizeSetter): number => {
  const number = parseFloat(value);
  return Strings.endsWith(value, '%') && SugarNode.name(cell) !== 'table' ? convert(cell, number, getter, setter) : number;
};

const getTotalHeight = (cell: SugarElement<HTMLTableCellElement>): number => {
  const value = getHeightValue(cell);
  if (!value) {
    return Height.get(cell);
  }
  return normalizePixelSize(value, cell, Height.get, setHeight);
};

const get = (cell: SugarElement<HTMLTableCellElement>, type: 'rowspan' | 'colspan', f: (e: SugarElement<HTMLTableCellElement>) => number): number => {
  const v = f(cell);
  const span = getSpan(cell, type);
  return v / span;
};

const getRaw = (element: SugarElement<HTMLElement>, prop: 'height' | 'width'): Optional<string> => {
  // Try to use the style first, otherwise attempt to get the value from an attribute
  return Css.getRaw(element, prop).orThunk(() => {
    return Attribute.getOpt(element, prop).map((val) => val + 'px');
  });
};

export const getRawWidth = (element: SugarElement<HTMLElement>): Optional<string> =>
  getRaw(element, 'width');

export const getRawHeight = (element: SugarElement<HTMLElement>): Optional<string> =>
  getRaw(element, 'height');

// Get a percentage size for a percentage parent table
export const getPercentageWidth = (cell: SugarElement<HTMLTableCellElement | HTMLTableColElement>): number =>
  getPercentSize(cell, Width.get, Width.getInner);

export const getPixelWidth = (cell: SugarElement<HTMLTableCellElement | HTMLTableColElement>): number =>
  // For col elements use the computed width as col elements aren't affected by borders, padding, etc...
  isCol(cell) ? Width.get(cell) : Width.getRuntime(cell);

export const getHeight = (cell: SugarElement<HTMLTableCellElement>): number => {
  return get(cell, 'rowspan', getTotalHeight);
};

export const getGenericWidth = (cell: SugarElement<HTMLElement>): Optional<Dimension.Dimension<'fixed' | 'relative' | 'empty'>> => {
  const width = getRawWidth(cell);
  return width.bind((w) => Dimension.parse(w, [ 'fixed', 'relative', 'empty' ]));
};

export const setGenericWidth = (cell: SugarElement<HTMLElement>, amount: number, unit: string): void => {
  Css.set(cell, 'width', amount + unit);
};

export const getPixelTableWidth = (table: SugarElement<HTMLTableElement>): string => Width.get(table) + 'px';
export const getPixelTableHeight = (table: SugarElement<HTMLTableElement>): string => Height.get(table) + 'px';

export const getPercentTableWidth = (table: SugarElement<HTMLTableElement>): string => getPercentSize(table, Width.get, Width.getInner) + '%';
export const getPercentTableHeight = (table: SugarElement<HTMLTableElement>): string => getPercentSize(table, Height.get, Height.getInner) + '%';

export const isPercentSizing = (table: SugarElement<HTMLTableElement>): boolean => getRawWidth(table).exists((size) => rPercentageBasedSizeRegex.test(size));
export const isPixelSizing = (table: SugarElement<HTMLTableElement>): boolean => getRawWidth(table).exists((size) => rPixelBasedSizeRegex.test(size));
export const isNoneSizing = (table: SugarElement<HTMLTableElement>): boolean => getRawWidth(table).isNone();

export const percentageBasedSizeRegex = Fun.constant(rPercentageBasedSizeRegex);
export const pixelBasedSizeRegex = Fun.constant(rPixelBasedSizeRegex);
