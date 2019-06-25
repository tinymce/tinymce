import { Focus, Height, Location, Width, Element } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import { Sizing, SizingSettings } from './Sizing';
import { PickerDirection } from '../api/PickerDirection';

export interface ATableApi {
  element: () => Element;
  setSelection: (numRows: number, numCols: number) => Element;
  setSize: (numRows: number, numCols: number) => void;
}

export const Redimension = function (direction: PickerDirection, settings: SizingSettings) {
  let active = false;

  const on = function () {
    active = true;
  };

  const off = function () {
    active = false;
  };

  const getDimensions = function (table: ATableApi) {
    const width = Width.get(table.element());
    const height = Height.get(table.element());
    return Structs.dimension(width, height);
  };

  const getPosition = function (table: ATableApi) {
    const position = Location.absolute(table.element());
    return Structs.coords(position.left(), position.top());
  };

  const updateSelection = function (table: ATableApi, grid: Structs.Grid, changes: Sizing) {
    const full = changes.full();
    if (full.row() !== grid.rows() || full.column() !== grid.columns()) {
      table.setSize(full.row(), full.column());
    }
    const last = table.setSelection(changes.selection().row(), changes.selection().column());
    Focus.focus(last);
  };

  /*
   * Based on the mouse position (x, y), identify whether the picker table needs to be resized
   * and update its selection
   */
  const mousemove = function (table: ATableApi, grid: Structs.Grid, x: number, y: number) {
    if (active) {
      const dimensions = getDimensions(table);
      const position = getPosition(table);
      const mouse = Structs.coords(x, y);
      const address = direction.pickerCell(position, dimensions, grid, mouse);
      const changes = Sizing.resize(address, settings);
      updateSelection(table, grid, changes);
    }
  };

  const manual = function (table: ATableApi, selected: Structs.Grid, xDelta: number, yDelta: number) {
    if (active) {
      const changes = Sizing.grow(selected, xDelta, yDelta, settings);
      updateSelection(table, selected, changes);
    }
  };

  return {
    on,
    off,
    mousemove,
    manual
  };
};