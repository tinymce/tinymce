import { Arr, Option } from '@ephox/katamari';
import { Attribute, Css, SugarElement } from '@ephox/sugar';
import { BarPositions, ColInfo } from '../resize/BarPositions';
import * as Sizes from '../resize/Sizes';
import { redistribute } from './Sizes';
import * as TableLookup from './TableLookup';
import { TableSize } from './TableSize';

// Remove legacy sizing attributes such as "width"
const cleanupLegacyAttributes = (element: SugarElement<HTMLElement>) => {
  Attribute.remove(element, 'width');
};

const convertToPercentSize = (table: SugarElement<HTMLTableElement>, direction: BarPositions<ColInfo>, tableSize: TableSize) => {
  const newWidth = Sizes.getPercentTableWidth(table);
  redistribute(table, Option.some(newWidth), Option.none(), direction, tableSize);
  cleanupLegacyAttributes(table);
};

const convertToPixelSize = (table: SugarElement<HTMLTableElement>, direction: BarPositions<ColInfo>, tableSize: TableSize) => {
  const newWidth = Sizes.getPixelTableWidth(table);
  redistribute(table, Option.some(newWidth), Option.none(), direction, tableSize);
  cleanupLegacyAttributes(table);
};

const convertToNoneSize = (table: SugarElement<HTMLTableElement>) => {
  Css.remove(table, 'width');
  Arr.each(TableLookup.cells(table), (cell) => {
    Css.remove(cell, 'width');
    cleanupLegacyAttributes(cell);
  });
  cleanupLegacyAttributes(table);
};

export {
  convertToPixelSize,
  convertToPercentSize,
  convertToNoneSize
};
