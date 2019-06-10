import { assert } from '@ephox/bedrock';
import { Arr, Fun, Result } from '@ephox/katamari';
import * as Structs from 'ephox/snooker/api/Structs';
import TableMerge from 'ephox/snooker/model/TableMerge';
import Fitment from 'ephox/snooker/test/Fitment';
import { SimpleGenerators } from 'ephox/snooker/api/Generators';
import { Element } from '@ephox/sugar';

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

const mergeTest = function (expected: Structs.ElementNew[][] | { error: string }, startAddress: Structs.Address, gridA: () => Structs.ElementNew[][], gridB: () => Structs.ElementNew[][], generator: () => SimpleGenerators, comparator: (a: Element, b: Element) => boolean) {
  // The last step, merge cells from gridB into gridA
  const nuGrid = TableMerge.merge(startAddress, mapToStructGrid(gridA()), mapToStructGrid(gridB()), generator(), comparator);
  nuGrid.fold(function (err) {
    if ('error' in expected) {
      assert.eq(expected.error, err);
    } else {
      assert.fail('Failure was unexpected, got error "' + err + '"');
    }
  }, function (grid) {
    if (!('error' in expected)) {
      assertGrids(mapToStructGrid(expected), grid);
    } else {
      assert.fail('Expected failure "' + expected.error + '" but instead got grid');
    }
  });
};

const mergeIVTest = function (asserter: (result: Result<Structs.RowCells[], string>, s: Structs.Address, specA: { rows: () => number; cols: () => number; grid: () => Structs.ElementNew[][]; }, specB: { rows: () => number; cols: () => number; grid: () => Structs.ElementNew[][]; }) => void, startAddress: Structs.Address, gridSpecA: { rows: () => number, cols: () => number, grid: () => Structs.ElementNew[][] }, gridSpecB: { rows: () => number, cols: () => number, grid: () => Structs.ElementNew[][] }, generator: () => SimpleGenerators, comparator: (a: Element, b: Element) => boolean) {
  // The last step, merge cells from gridB into gridA
  const nuGrid = TableMerge.merge(startAddress, mapToStructGrid(gridSpecA.grid()), mapToStructGrid(gridSpecB.grid()), generator(), comparator);
  asserter(nuGrid, startAddress, gridSpecA, gridSpecB);
};

const suite = function (label: string, startAddress: Structs.Address, gridA: () => Structs.ElementNew[][], gridB: () => Structs.ElementNew[][], generator: () => SimpleGenerators, comparator: (a: Element, b: Element) => boolean, expectedMeasure: {rowDelta: number, colDelta: number }, expectedTailor: Structs.ElementNew[][], expectedMergeGrids: Structs.ElementNew[][]) {
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