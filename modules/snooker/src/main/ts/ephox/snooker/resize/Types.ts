import { Element } from '@ephox/sugar';
import { Warehouse } from '../model/Warehouse';
import { BarPositions, ColInfo } from './BarPositions';

export interface TableSize {
  readonly width: number;
  readonly pixelWidth: number;
  readonly getWidths: (warehouse: Warehouse, direction: BarPositions<ColInfo>, tableSize: TableSize) => number[];
  readonly getCellDelta: (delta: number) => number;
  readonly singleColumnWidth: (w: number, delta: number) => number[];
  readonly minCellWidth: () => number;
  readonly setElementWidth: (cell: Element, amount: number) => void;
  readonly setTableWidth: (table: Element, newWidths: number[], delta: number) => void;
}
