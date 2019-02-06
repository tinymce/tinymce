import { Arr } from '@ephox/katamari';
import Structs from 'ephox/snooker/api/Structs';
import Fitment from 'ephox/snooker/model/Fitment';
import { assert } from '@ephox/bedrock';

var mapToStructGrid = function (grid) {
  return Arr.map(grid, function (row) {
    return Structs.rowcells(row, 'tbody');
  });
};

var assertGrids = function (expected, actual) {
  assert.eq(expected.length, actual.length);
  Arr.each(expected, function (row, i) {
    Arr.each(row.cells(), function (cell, j) {
      assert.eq(cell.element(), actual[i].cells()[j].element());
      assert.eq(cell.isNew(), actual[i].cells()[j].isNew());
    });
    assert.eq(row.section(), actual[i].section());
  });
};

var measureTest = function (expected, startAddress, gridA, gridB) {
  // Try put gridB into gridA at the startAddress
  // returns a delta,
  // colDelta = -3 means gridA is 3 columns too short
  // rowDelta = 3 means gridA can fit gridB with 3 rows to spare

  Fitment.measure(startAddress, mapToStructGrid(gridA()), mapToStructGrid(gridB())).fold(function (err) {
    assert.eq(expected.error, err);
  }, function (delta) {
    assert.eq(expected.rowDelta, delta.rowDelta(), 'rowDelta expected: ' + expected.rowDelta + ' actual: '+ delta.rowDelta());
    assert.eq(expected.colDelta, delta.colDelta(), 'colDelta expected: ' + expected.colDelta + ' actual: '+ delta.colDelta());
  });
};

var tailorTest = function (expected, startAddress, gridA, delta, generator) {
  // Based on the Fitment.measure
  // Increase gridA by the row/col delta values
  // The result is a new grid that will perfectly fit gridB into gridA
  var tailoredGrid = Fitment.tailor(mapToStructGrid(gridA()), delta, generator());
  assertGrids(mapToStructGrid(expected), tailoredGrid);
};

var tailorIVTest = function (expected, startAddress, gridA, delta, generator) {
  var tailoredGrid = Fitment.tailor(mapToStructGrid(gridA()), delta, generator());
  var rows = tailoredGrid.length;
  var cols = tailoredGrid[0].cells().length;
  assert.eq(expected.rows, rows);
  assert.eq(expected.cols, cols);
};

export default {
  measureTest: measureTest,
  tailorTest: tailorTest,
  tailorIVTest: tailorIVTest
};