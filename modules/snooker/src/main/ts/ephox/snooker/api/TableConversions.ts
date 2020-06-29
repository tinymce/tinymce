import { Arr, Option } from '@ephox/katamari';
import { Css, Element } from '@ephox/sugar';
import { BarPositions, ColInfo } from '../resize/BarPositions';
import * as Sizes from '../resize/Sizes';
import { redistribute } from './Sizes';
import * as TableLookup from './TableLookup';
import { TableSize } from './TableSize';

const convertToPercentSize = (table: Element, direction: BarPositions<ColInfo>, tableSize: TableSize) => {
  const newWidth = Sizes.getPercentTableWidth(table);
  redistribute(table, Option.some(newWidth), Option.none(), direction, tableSize);
};

const convertToPixelSize = (table: Element, direction: BarPositions<ColInfo>, tableSize: TableSize) => {
  const newWidth = Sizes.getPixelTableWidth(table);
  redistribute(table, Option.some(newWidth), Option.none(), direction, tableSize);
};

const convertToNoneSize = (table: Element) => {
  Css.remove(table, 'width');
  Arr.each(TableLookup.cells(table), (cell) => Css.remove(cell, 'width'));
};

export {
  convertToPixelSize,
  convertToPercentSize,
  convertToNoneSize
};
