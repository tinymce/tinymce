import { Arr } from '@ephox/katamari';
import * as Structs from 'ephox/snooker/api/Structs';
import Fitment, { Delta } from 'ephox/snooker/model/Fitment';
import { assert } from '@ephox/bedrock-client';
import { SimpleGenerators } from 'ephox/snooker/api/Generators';

const mapToStructGrid = function (grid: Structs.ElementNew[][]) {
  return Arr.map(grid, function (row) {
    return Structs.rowcells(row, 'tbody');
  });
};

const assertGrids = function (expected: Structs.RowCells[], actual: Structs.RowCells[]) {
  assert.eq(expected.length, actual.length);
  Arr.each(expected, function (row, i) {
    Arr.each(row.cells(), function (cell, j) {
      assert.eq(cell.element(), actual[i].cells()[j].element());
      assert.eq(cell.isNew(), actual[i].cells()[j].isNew());
    });
    assert.eq(row.section(), actual[i].section());
  });
};

const measureTest = function (expected: { error: string } | {rowDelta: number, colDelta: number }, startAddress: Structs.Address, gridA: () => Structs.ElementNew[][], gridB: () => Structs.ElementNew[][]) {
  // Try put gridB into gridA at the startAddress
  // returns a delta,
  // colDelta = -3 means gridA is 3 columns too short
  // rowDelta = 3 means gridA can fit gridB with 3 rows to spare

  Fitment.measure(startAddress, mapToStructGrid(gridA()), mapToStructGrid(gridB())).fold(function (err) {
    if ('error' in expected) {
      assert.eq(expected.error, err);
    } else {
      assert.fail('An error was not expected. Message was "' + err + '"');
    }
  }, function (delta) {
    if ('rowDelta' in expected) {
      assert.eq(expected.rowDelta, delta.rowDelta(), 'rowDelta expected: ' + expected.rowDelta + ' actual: ' + delta.rowDelta());
      assert.eq(expected.colDelta, delta.colDelta(), 'colDelta expected: ' + expected.colDelta + ' actual: ' + delta.colDelta());
    } else {
      assert.fail('Expected error "' + expected.error + '" but instead got rowDelta=' + delta.rowDelta() + ' colDelta=' + delta.colDelta());
    }
  });
};

const tailorTest = function (expected: Structs.ElementNew[][], startAddress: Structs.Address, gridA: () => Structs.ElementNew[][], delta: Delta, generator: () => SimpleGenerators) {
  // Based on the Fitment.measure
  // Increase gridA by the row/col delta values
  // The result is a new grid that will perfectly fit gridB into gridA
  const tailoredGrid = Fitment.tailor(mapToStructGrid(gridA()), delta, generator());
  assertGrids(mapToStructGrid(expected), tailoredGrid);
};

const tailorIVTest = function (expected: { rows: number, cols: number }, startAddress: Structs.Address, gridA: () => Structs.ElementNew[][], delta: Delta, generator: () => SimpleGenerators) {
  const tailoredGrid = Fitment.tailor(mapToStructGrid(gridA()), delta, generator());
  const rows = tailoredGrid.length;
  const cols = tailoredGrid[0].cells().length;
  assert.eq(expected.rows, rows);
  assert.eq(expected.cols, cols);
};

export default {
  measureTest,
  tailorTest,
  tailorIVTest
};
