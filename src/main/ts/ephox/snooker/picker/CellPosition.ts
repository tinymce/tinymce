import Structs from '../api/Structs';

/*
 * Determine the address(row, column) of a mouse position on the entire document based
 * on position being the (x, y) coordinate of the picker component.
 */
var findCell = function (dimensions, grid, deltaX, deltaY) {
  var cellWidth = dimensions.width()/grid.columns();
  var cellHeight = dimensions.height()/grid.rows();

  var col = Math.floor(deltaX/cellWidth);
  var row = Math.floor(deltaY/cellHeight);

  return Structs.address(row, col);
};

var findCellRtl = function (position, dimensions, grid, mouse) {
  var deltaX = position.x() + dimensions.width() - mouse.x();
  var deltaY = mouse.y() - position.y();

  return findCell(dimensions, grid, deltaX, deltaY);
};

var findCellLtr = function (position, dimensions, grid, mouse) {
  var deltaX = mouse.x() - position.x();
  var deltaY = mouse.y() - position.y();

  return findCell(dimensions, grid, deltaX, deltaY);
};

export default {
  findCellRtl: findCellRtl,
  findCellLtr: findCellLtr
};