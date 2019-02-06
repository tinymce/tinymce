import Structs from '../api/Structs';
import Sizing from './Sizing';
import { Focus } from '@ephox/sugar';
import { Height } from '@ephox/sugar';
import { Location } from '@ephox/sugar';
import { Width } from '@ephox/sugar';



export default function (direction, settings) {
  var active = false;

  var on = function () {
    active = true;
  };

  var off = function () {
    active = false;
  };

  var getDimensions = function (table) {
    var width = Width.get(table.element());
    var height = Height.get(table.element());
    return Structs.dimensions(width, height);
  };

  var getPosition = function (table) {
    var position = Location.absolute(table.element());
    return Structs.coords(position.left(), position.top());
  };

  var updateSelection = function (table, grid, changes) {
    var full = changes.full();
    if (full.row() !== grid.rows() || full.column() !== grid.columns()) table.setSize(full.row(), full.column());
    var last = table.setSelection(changes.selection().row(), changes.selection().column());
    Focus.focus(last);
  };

  /*
   * Based on the mouse position (x, y), identify whether the picker table needs to be resized
   * and update its selection
   */
  var mousemove = function (table, grid, x, y) {
    if (active) {
      var dimensions = getDimensions(table);
      var position = getPosition(table);
      var mouse = Structs.coords(x, y);
      var address = direction.pickerCell(position, dimensions, grid, mouse);
      var changes = Sizing.resize(address, settings);
      updateSelection(table, grid, changes);
    }
  };

  var manual = function (table, selected, xDelta, yDelta) {
    if (active) {
      var changes = Sizing.grow(selected, xDelta, yDelta, settings);
      updateSelection(table, selected, changes);
    }
  };

  return {
    on: on,
    off: off,
    mousemove: mousemove,
    manual: manual
  };
};