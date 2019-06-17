import * as Structs from 'ephox/snooker/api/Structs';
import CellPosition from 'ephox/snooker/picker/CellPosition';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('CellPositionLtrTest', function () {
  const check = function (expected: { row: number, col: number }, posX: number, posY: number, width: number, height: number, rows: number, cols: number, x: number, y: number) {
   const position = Structs.coords(posX, posY);
   const dimensions = Structs.dimension(width, height);
   const grid = Structs.grid(rows, cols);
   const mouse = Structs.coords(x, y);
   const actual = CellPosition.findCellLtr(position, dimensions, grid, mouse);
   assert.eq(expected.col, actual.column());
   assert.eq(expected.row, actual.row());
  };

  check({row: 0, col: 0}, 0, 0, 500, 500, 10, 10, 0, 0);
  check({row: 2, col: 2}, 0, 0, 500, 500, 10, 10, 110, 100);
  check({row: 0, col: 2}, 0, 0, 500, 500, 10, 10, 110, 10);
  check({row: 2, col: 1}, 0, 0, 300, 1000, 10, 5, 110, 210);
  check({row: 0, col: 1}, 50, 180, 300, 1000, 10, 5, 110, 210);
});
