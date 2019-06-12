import { Fun } from '@ephox/katamari';
import * as Structs from '../api/Structs';

export interface SizingSettings {
  maxCols: number;
  maxRows: number;
  minCols: number;
  minRows: number;
}

export interface Sizing {
  selection: () => Structs.Address;
  full: () => Structs.Address;
}

const translate = function (cell: Structs.Address, row: number, column: number) {
  return Structs.address(cell.row() + row, cell.column() + column);
};

const validate = function (cell: Structs.Address, minX: number, maxX: number, minY: number, maxY: number) {
  const row =  Math.max(minY, Math.min(maxY, cell.row()));
  const col = Math.max(minX, Math.min(maxX, cell.column()));
  return Structs.address(row, col);
};

const process = function (newSize: Structs.Address, settings: SizingSettings): Sizing {
  const selection = validate(newSize, 1, settings.maxCols, 1, settings.maxRows);
  const full = validate(translate(selection, 1, 1), settings.minCols, settings.maxCols, settings.minRows, settings.maxRows);
  return {
    selection: Fun.constant(selection),
    full: Fun.constant(full)
  };
};

/*
 * Given a (row, column) address of the current mouse, identify the table size
 * and current selection.
 */
const resize = function (address: Structs.Address, settings: SizingSettings) {
  const newSize = translate(address, 1, 1);
  return process(newSize, settings);
};

const grow = function (selected: Structs.Grid, xDelta: number, yDelta: number, settings: SizingSettings) {
  const newSize = Structs.address(selected.rows() + yDelta, selected.columns() + xDelta);
  return process(newSize, settings);
};

export const Sizing = {
  resize,
  grow
};