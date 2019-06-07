import * as Structs from '../api/Structs';

/*
 * Determine the address(row, column) of a mouse position on the entire document based
 * on position being the (x, y) coordinate of the picker component.
 */
const findCell = function (dimensions: Structs.Dimension, grid: Structs.Grid, deltaX: number, deltaY: number) {
  const cellWidth = dimensions.width() / grid.columns();
  const cellHeight = dimensions.height() / grid.rows();

  const col = Math.floor(deltaX / cellWidth);
  const row = Math.floor(deltaY / cellHeight);

  return Structs.address(row, col);
};

const findCellRtl = function (position: Structs.Coords, dimensions: Structs.Dimension, grid: Structs.Grid, mouse: Structs.Coords) {
  const deltaX = position.x() + dimensions.width() - mouse.x();
  const deltaY = mouse.y() - position.y();

  return findCell(dimensions, grid, deltaX, deltaY);
};

const findCellLtr = function (position: Structs.Coords, dimensions: Structs.Dimension, grid: Structs.Grid, mouse: Structs.Coords) {
  const deltaX = mouse.x() - position.x();
  const deltaY = mouse.y() - position.y();

  return findCell(dimensions, grid, deltaX, deltaY);
};

export default {
  findCellRtl,
  findCellLtr
};