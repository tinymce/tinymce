import { assert } from '@ephox/bedrock';
import { Arr, Fun } from '@ephox/katamari';
import Structs from 'ephox/snooker/api/Structs';
import TableMerge from 'ephox/snooker/model/TableMerge';
import Fitment from 'ephox/snooker/test/Fitment';

const mapToStructGrid = function (grid) {
  return Arr.map(grid, function (row) {
    return Structs.rowcells(row, 'tbody');
  });
};

const assertGrids = function (expected, actual) {
  assert.eq(expected.length, actual.length);
  Arr.each(expected, function (row, i) {
    Arr.each(row.cells(), function (cell, j) {
      assert.eq(cell.element(), actual[i].cells()[j].element());
      assert.eq(cell.isNew(), actual[i].cells()[j].isNew());
    });
    assert.eq(row.section(), actual[i].section());
  });
};

const mergeTest = function (expected, startAddress, gridA, gridB, generator, comparator) {
  // The last step, merge cells from gridB into gridA
  const nuGrid = TableMerge.merge(startAddress, mapToStructGrid(gridA()), mapToStructGrid(gridB()), generator(), comparator);
  nuGrid.fold(function (err) {
    assert.eq(expected.error, err);
  }, function (grid) {
    assertGrids(mapToStructGrid(expected), grid);
  });
};

const mergeIVTest = function (asserter, startAddress, gridSpecA, gridSpecB, generator, comparator) {
  // The last step, merge cells from gridB into gridA
  const nuGrid = TableMerge.merge(startAddress, mapToStructGrid(gridSpecA.grid()), mapToStructGrid(gridSpecB.grid()), generator(), comparator);
  asserter(nuGrid, startAddress, gridSpecA, gridSpecB);
};

const suite = function (label, startAddress, gridA, gridB, generator, comparator, expectedMeasure, expectedTailor, expectedMergeGrids) {
  Fitment.measureTest(expectedMeasure, startAddress, gridA, gridB);
  Fitment.tailorTest(expectedTailor, startAddress, gridA, {
    rowDelta: Fun.constant(expectedMeasure.rowDelta),
    colDelta: Fun.constant(expectedMeasure.colDelta)
  }, generator);
  mergeTest(expectedMergeGrids, startAddress, gridA, gridB, generator, comparator);
};

export default {
  mergeTest,
  mergeIVTest,
  suite
};