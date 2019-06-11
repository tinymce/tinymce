import { Warehouse } from '../model/Warehouse';
import { Element } from '@ephox/sugar';
import { BarPositions, ColInfo } from './BarPositions';

export interface TableSize {
  width: () => number;
  pixelWidth: () => number;
  getWidths: (warehouse: Warehouse, direction: BarPositions<ColInfo>, tableSize: TableSize) => number[];
  getCellDelta: (delta: number) => number;
  singleColumnWidth: (w: number, delta: number) => number[];
  minCellWidth: () => number;
  setElementWidth: (cell: Element, amount: number) => void;
  setTableWidth: (table: Element, newWidths: number[], delta: number) => void;
}