import { Focus, Height, Location, Width } from '@ephox/sugar';
import Structs from '../api/Structs';
import Sizing from './Sizing';

export default function (direction, settings) {
  let active = false;

  const on = function () {
    active = true;
  };

  const off = function () {
    active = false;
  };

  const getDimensions = function (table) {
    const width = Width.get(table.element());
    const height = Height.get(table.element());
    return Structs.dimensions(width, height);
  };

  const getPosition = function (table) {
    const position = Location.absolute(table.element());
    return Structs.coords(position.left(), position.top());
  };

  const updateSelection = function (table, grid, changes) {
    const full = changes.full();
    if (full.row() !== grid.rows() || full.column() !== grid.columns()) { table.setSize(full.row(), full.column()); }
    const last = table.setSelection(changes.selection().row(), changes.selection().column());
    Focus.focus(last);
  };

  /*
   * Based on the mouse position (x, y), identify whether the picker table needs to be resized
   * and update its selection
   */
  const mousemove = function (table, grid, x, y) {
    if (active) {
      const dimensions = getDimensions(table);
      const position = getPosition(table);
      const mouse = Structs.coords(x, y);
      const address = direction.pickerCell(position, dimensions, grid, mouse);
      const changes = Sizing.resize(address, settings);
      updateSelection(table, grid, changes);
    }
  };

  const manual = function (table, selected, xDelta, yDelta) {
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
}