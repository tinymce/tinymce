import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Generators } from 'ephox/snooker/api/Generators';
import * as Structs from 'ephox/snooker/api/Structs';
import * as ModificationOperations from 'ephox/snooker/operate/ModificationOperations';
import TestGenerator from 'ephox/snooker/test/TestGenerator';
import { Element } from '@ephox/sugar';

UnitTest.test('ModificationOperationsTest', function () {
  const r = Structs.rowcells;
  const en = (fakeElement: any, isNew: boolean) => Structs.elementnew(fakeElement as Element, isNew);
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

  // Test basic insert column
  (function () {
    const check = function (expected: Structs.RowCells[], grid: Structs.RowCells[], example: number, index: number) {
      const actual = ModificationOperations.insertColumnAt(grid, index, example, Fun.tripleEquals, Generators.modification(TestGenerator(), Fun.identity as any).getOrInit);
      assertGrids(expected, actual);
    };
    const checkBody = function (expected: Structs.ElementNew[][], grid: Structs.ElementNew[][], example: number, index: number) {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      check(structExpected, structGrid, example, index);
    };

    checkBody([], [], 0, 0);
    checkBody([[ en('?_0', true), en('a', false) ]], [[ en('a', false) ]], 0, 0);
    checkBody([[ en('a', false), en('?_0', true) ]], [[ en('a', false) ]], 0, 1);
    checkBody(
      [
        [ en('a', false), en('?_0', true) ],
        [ en('b', false), en('?_1', true) ]
      ],
      [
        [ en('a', false) ],
        [ en('b', false) ]
      ], 0, 1
    );
    checkBody(
      [
        [ en('?_0', true), en('a', false) ],
        [ en('?_1', true), en('b', false) ]
      ],
      [
        [ en('a', false) ],
        [ en('b', false) ]
      ], 0, 0
    );
    // Spanning check.
    checkBody(
      [
        [ en('a', false), en('a', false), en('a', false) ],
        [ en('b', false), en('?_0', true), en('c', false) ]
      ],
      [
        [ en('a', false), en('a', false) ],
        [ en('b', false), en('c', false) ]
      ], 0, 1
    );
    checkBody(
      [
        [ en('a', false), en('b', false), en('?_0', true) ],
        [ en('c', false), en('b', false), en('?_0', true) ],
        [ en('c', false), en('d', false), en('?_1', true) ]
      ],
      [
        [ en('a', false), en('b', false) ],
        [ en('c', false), en('b', false) ],
        [ en('c', false), en('d', false) ]
      ], 1, 2
    );

    check(
      [
        r([ en('a', false), en('?_0', true) ], 'thead'),
        r([ en('b', false), en('?_1', true) ], 'tbody')
      ],
      [
        r([ en('a', false) ], 'thead'),
        r([ en('b', false) ], 'tbody')
      ], 0, 1
    );

    check(
      [
        r([ en('?_0', true), en('a', false) ], 'thead'),
        r([ en('?_1', true), en('b', false) ], 'tbody')
      ],
      [
        r([ en('a', false) ], 'thead'),
        r([ en('b', false) ], 'tbody')
      ], 0, 0
    );

    check(
      [
        r([ en('a', false), en('a', false), en('a', false) ], 'thead'),
        r([ en('b', false), en('?_0', true), en('c', false) ], 'tbody')
      ],
      [
        r([ en('a', false), en('a', false) ], 'thead'),
        r([ en('b', false), en('c', false) ], 'tbody')
      ], 0, 1
    );
  })();

  // Test basic insert row
  (function () {
    const check = function (expected: Structs.RowCells[], grid: Structs.RowCells[], example: number, index: number) {
      const actual = ModificationOperations.insertRowAt(grid, index, example, Fun.tripleEquals, Generators.modification(TestGenerator(), Fun.identity as any).getOrInit);
      assertGrids(expected, actual);
    };

    const checkBody = function (expected: Structs.ElementNew[][], grid: Structs.ElementNew[][], example: number, index: number) {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      check(structExpected, structGrid, example, index);
    };

    checkBody([[ en('?_0', true) ], [ en('a', false) ]], [[ en('a', false) ]], 0, 0);
    checkBody([[ en('a', false) ], [ en('?_0', true) ]], [[ en('a', false) ]], 0, 1);
    checkBody([[ en('a', false), en('b', false) ], [ en('?_0', true), en('?_1', true) ]], [[ en('a', false), en('b', false) ]], 0, 1);
    checkBody([[ en('a', false), en('a', false) ], [ en('?_0', true), en('?_0', true) ]], [[ en('a', false), en('a', false) ]], 0, 1);

    checkBody(
      [
        [ en('a', false), en('a', false), en('b', false) ],
        [ en('?_0', true), en('?_0', true), en('b', false) ],
        [ en('c', false), en('d', false), en('b', false) ]
      ],
      [
        [ en('a', false), en('a', false), en('b', false) ],
        [ en('c', false), en('d', false), en('b', false) ]
      ], 0, 1);

    check(
      [
        r([ en('a', false), en('b', false), en('c', false) ], 'thead'),
        r([ en('?_0', true), en('?_1', true), en('?_2', true) ], 'thead'),
        r([ en('d', false), en('e', false), en('f', false) ], 'tbody')
      ],
      [
        r([ en('a', false), en('b', false), en('c', false) ], 'thead'),
        r([ en('d', false), en('e', false), en('f', false) ], 'tbody')
      ], 0, 1);

    check(
      [
        r([ en('a', false), en('b', false), en('c', false) ], 'thead'),
        r([ en('?_0', true), en('?_1', true), en('?_2', true) ], 'tbody'),
        r([ en('d', false), en('e', false), en('f', false) ], 'tbody')
      ],
      [
        r([ en('a', false), en('b', false), en('c', false) ], 'thead'),
        r([ en('d', false), en('e', false), en('f', false) ], 'tbody')
      ], 1, 1);
  })();

  // Test basic delete column
  (function () {
    const check = function (expected: Structs.RowCells[], grid: Structs.RowCells[], index: number) {
      const actual = ModificationOperations.deleteColumnsAt(grid, index, index);
      assertGrids(expected, actual);
    };

    const checkBody = function (expected: Structs.ElementNew[][], grid: Structs.ElementNew[][], index: number) {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      check(structExpected, structGrid, index);
    };

    checkBody([], [[ en('a', false) ]], 0);
    checkBody([[ en('b', false) ]], [[ en('a', false), en('b', false) ]], 0);
    checkBody(
      [
        [ en('a', false), en('b', false) ],
        [ en('c', false), en('c', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('b', false) ],
        [ en('c', false), en('c', false), en('c', false) ]
      ], 1);
    check(
      [
        r([ en('a', false), en('b', false) ], 'thead'),
        r([ en('c', false), en('c', false) ], 'tbody')
      ],
      [
        r([ en('a', false), en('b', false), en('b', false) ], 'thead'),
        r([ en('c', false), en('c', false), en('c', false) ], 'tbody')
      ], 1);
  })();

  // Test basic delete row
  (function () {
    const check = function (expected: Structs.RowCells[], grid: Structs.RowCells[], index: number) {
      const actual = ModificationOperations.deleteRowsAt(grid, index, index);
      assertGrids(expected, actual);
    };

    const checkBody = function (expected: Structs.ElementNew[][], grid: Structs.ElementNew[][], index: number) {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      check(structExpected, structGrid, index);
    };

    checkBody([], [[ en('a', false) ]], 0);
    checkBody([[ en('b', false) ]], [[ en('a', false) ], [ en('b', false) ]], 0);
    checkBody(
      [
        [ en('a', false), en('b', false), en('b', false) ],
        [ en('c', false), en('c', false), en('c', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('b', false) ],
        [ en('a', false), en('b', false), en('b', false) ],
        [ en('c', false), en('c', false), en('c', false) ]
      ], 1);

    check(
      [
        r([ en('a', false), en('b', false), en('b', false) ], 'thead'),
        r([ en('c', false), en('c', false), en('c', false) ], 'tbody')
      ],
      [
        r([ en('a', false), en('b', false), en('b', false) ], 'thead'),
        r([ en('a', false), en('b', false), en('b', false) ], 'tbody'),
        r([ en('c', false), en('c', false), en('c', false) ], 'tbody')
      ], 1);
  })();

  (function () {
    const check = function (expected: Structs.RowCells[], grid: Structs.RowCells[], exRow: number, exCol: number) {
      const actual = ModificationOperations.splitCellIntoColumns(grid, exRow, exCol, Fun.tripleEquals, Generators.modification(TestGenerator(), Fun.identity as any).getOrInit);
      assertGrids(expected, actual);
    };

    const checkBody = function (expected: Structs.ElementNew[][], grid: Structs.ElementNew[][], exRow: number, exCol: number) {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      check(structExpected, structGrid, exRow, exCol);
    };

    // splitting simple tables without existing colspans
    checkBody([[ en('a', false), en('?_0', true) ]], [[ en('a', false) ]], 0, 0);
    checkBody([[ en('a', false), en('?_0', true), en('b', false) ]], [[ en('a', false), en('b', false) ]], 0, 0);
    checkBody([[ en('a', false), en('b', false), en('?_0', true) ]], [[ en('a', false), en('b', false) ]], 0, 1);
    checkBody(
      [
        [ en('a', false), en('b', false), en('?_0', true) ],
        [ en('c', false), en('d', false), en('d', false) ]
      ],
      [
        [ en('a', false), en('b', false) ],
        [ en('c', false), en('d', false) ]
      ], 0, 1
    );
    checkBody(
      [
        [ en('a', false), en('?_0', true), en('b', false), en('c', false) ],
        [ en('d', false), en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('g', false), en('h', false), en('i', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false) ]
      ], 0, 0
    );
    checkBody(
      [
        [ en('a', false), en('b', false), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('?_0', true), en('f', false) ],
        [ en('g', false), en('h', false), en('h', false), en('i', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false) ]
      ], 1, 1
    );
    checkBody(
      [
        [ en('a', false), en('b', false), en('c', false), en('c', false) ],
        [ en('d', false), en('e', false), en('f', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false), en('?_0', true) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false) ]
      ], 2, 2
    );
    checkBody(
      [
        [ en('a', false), en('b', false), en('c', false), en('?_0', true) ],
        [ en('d', false), en('e', false), en('f', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false), en('i', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false) ]
      ], 0, 2
    );
    checkBody(
      [
        [ en('a', false), en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('?_0', true), en('h', false), en('i', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false) ]
      ], 2, 0
    );
    // Splitting a cell where other cells have colspans
    checkBody(
      [
        [ en('a', false), en('b', false), en('?_0', true) ],
        [ en('c', false), en('c', false), en('c', false) ]
      ],
      [
        [ en('a', false), en('b', false) ],
        [ en('c', false), en('c', false) ]
      ], 0, 1
    );
    checkBody(
      [
        [ en('a', false), en('?_0', true), en('b', false), en('c', false) ],
        [ en('d', false), en('d', false), en('d', false), en('f', false) ],
        [ en('g', false), en('g', false), en('h', false), en('h', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('d', false), en('f', false) ],
        [ en('g', false), en('h', false), en('h', false) ]
      ], 0, 0
    );
    checkBody(
      [
        [ en('a', false), en('a', false), en('a', false), en('a', false) ],
        [ en('d', false), en('e', false), en('?_0', true), en('f', false) ],
        [ en('g', false), en('h', false), en('h', false), en('h', false) ]
      ],
      [
        [ en('a', false), en('a', false), en('a', false) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('h', false), en('h', false) ]
      ], 1, 1
    );
    checkBody(
      [
        [ en('a', false), en('a', false), en('c', false), en('c', false) ],
        [ en('d', false), en('d', false), en('d', false), en('d', false) ],
        [ en('g', false), en('h', false), en('i', false), en('?_0', true) ]
      ],
      [
        [ en('a', false), en('a', false), en('c', false) ],
        [ en('d', false), en('d', false), en('d', false) ],
        [ en('g', false), en('h', false), en('i', false) ]
      ], 2, 2
    );
    checkBody(
      [
        [ en('a', false), en('b', false), en('c', false), en('?_0', true) ],
        [ en('d', false), en('e', false), en('e', false), en('e', false) ],
        [ en('g', false), en('g', false), en('i', false), en('i', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('e', false) ],
        [ en('g', false), en('g', false), en('i', false) ]
      ], 0, 2
    );
    checkBody(
      [
        [ en('a', false), en('a', false), en('a', false), en('c', false) ],
        [ en('a', false), en('a', false), en('a', false), en('a', false) ],
        [ en('g', false), en('?_0', true), en('h', false), en('i', false) ]
      ],
      [
        [ en('a', false), en('a', false), en('c', false) ],
        [ en('a', false), en('a', false), en('a', false) ],
        [ en('g', false), en('h', false), en('i', false) ]
      ], 2, 0
    );
    // splitting a cell which is already merged
    checkBody(
      [
        [ en('a', false), en('a', false), en('a', false), en('a', false) ],
        [ en('a', false), en('a', false), en('?_0', true), en('a', false) ],
        [ en('a', false), en('a', false), en('a', false), en('a', false) ]
      ],
      [
        [ en('a', false), en('a', false), en('a', false) ],
        [ en('a', false), en('a', false), en('a', false) ],
        [ en('a', false), en('a', false), en('a', false) ]
      ], 1, 1
    );
    check(
      [
        r([ en('a', false), en('b', false), en('c', false), en('?_0', true) ], 'thead'),
        r([ en('d', false), en('e', false), en('e', false), en('e', false) ], 'tbody'),
        r([ en('g', false), en('g', false), en('i', false), en('i', false) ], 'tbody')
      ],
      [
        r([ en('a', false), en('b', false), en('c', false) ], 'thead'),
        r([ en('d', false), en('e', false), en('e', false) ], 'tbody'),
        r([ en('g', false), en('g', false), en('i', false) ], 'tbody')
      ], 0, 2
    );

    check(
      [
        r([ en('a', false), en('a', false), en('a', false), en('c', false) ], 'thead'),
        r([ en('a', false), en('a', false), en('a', false), en('a', false) ], 'tbody'),
        r([ en('g', false), en('?_0', true), en('h', false), en('i', false) ], 'tbody')
      ],
      [
        r([ en('a', false), en('a', false), en('c', false) ], 'thead'),
        r([ en('a', false), en('a', false), en('a', false) ], 'tbody'),
        r([ en('g', false), en('h', false), en('i', false) ], 'tbody')
      ], 2, 0
    );
  })();

  (function () {
    const check = function (expected: Structs.RowCells[], grid: Structs.RowCells[], exRow: number, exCol: number) {
      const actual = ModificationOperations.splitCellIntoRows(grid, exRow, exCol, Fun.tripleEquals, Generators.modification(TestGenerator(), Fun.identity as any).getOrInit);
      assertGrids(expected, actual);
    };

    const checkBody = function (expected: Structs.ElementNew[][], grid: Structs.ElementNew[][], exRow: number, exCol: number) {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      check(structExpected, structGrid, exRow, exCol);
    };

    // splitting simple tables without existing rowspans
    // checkBody([], [], 0, 0); // ?? table without rows will fail - a problem?
    // checkBody([[]], [], 0, 0); // This case shouldn't come up?
    checkBody([[], []], [[]], 0, 0);
    checkBody([[ en('a', false) ], [ en('?_0', true) ]], [[ en('a', false) ]], 0, 0);
    checkBody([[ en('a', false), en('b', false) ], [ en('?_0', true), en('b', false) ]], [[ en('a', false), en('b', false) ]], 0, 0);
    checkBody([[ en('a', false), en('b', false) ], [ en('a', false), en('?_0', true) ]], [[ en('a', false), en('b', false) ]], 0, 1);
    checkBody(
      [
        [ en('a', false), en('b', false) ],
        [ en('a', false), en('?_0', true) ],
        [ en('c', false), en('d', false) ]
      ],
      [
        [ en('a', false), en('b', false) ],
        [ en('c', false), en('d', false) ]
      ], 0, 1
    );
    checkBody(
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('?_0', true), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false) ]
      ], 0, 0
    );
    checkBody(
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('d', false), en('?_0', true), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false) ]
      ], 1, 1
    );
    checkBody(
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false) ],
        [ en('g', false), en('h', false), en('?_0', true) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false) ]
      ], 2, 2
    );
    checkBody(
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('a', false), en('b', false), en('?_0', true) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false) ]
      ], 0, 2
    );
    checkBody(
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false) ],
        [ en('?_0', true), en('h', false), en('i', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('e', false), en('f', false) ],
        [ en('g', false), en('h', false), en('i', false) ]
      ], 2, 0
    );
    // Splitting a cell where other cells have rowspans
    checkBody(
      [
        [ en('a', false), en('b', false) ],
        [ en('a', false), en('?_0', true) ],
        [ en('a', false), en('c', false) ]
      ],
      [
        [ en('a', false), en('b', false) ],
        [ en('a', false), en('c', false) ]
      ], 0, 1
    );
    checkBody(
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('?_0', true), en('b', false), en('c', false) ],
        [ en('d', false), en('b', false), en('f', false) ],
        [ en('g', false), en('h', false), en('f', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('d', false), en('b', false), en('f', false) ],
        [ en('g', false), en('h', false), en('f', false) ]
      ], 0, 0
    );
    checkBody(
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('a', false), en('e', false), en('c', false) ],
        [ en('a', false), en('?_0', true), en('c', false) ],
        [ en('a', false), en('e', false), en('f', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('a', false), en('e', false), en('c', false) ],
        [ en('a', false), en('e', false), en('f', false) ]
      ], 1, 1
    );
    checkBody(
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('a', false), en('b', false), en('i', false) ],
        [ en('a', false), en('h', false), en('i', false) ],
        [ en('a', false), en('h', false), en('?_0', true) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('a', false), en('b', false), en('i', false) ],
        [ en('a', false), en('h', false), en('i', false) ]
      ], 2, 2
    );
    checkBody(
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('a', false), en('b', false), en('?_0', true) ],
        [ en('a', false), en('e', false), en('e', false) ],
        [ en('d', false), en('e', false), en('i', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('a', false), en('e', false), en('e', false) ],
        [ en('d', false), en('e', false), en('i', false) ]
      ], 0, 2
    );
    checkBody(
      [
        [ en('a', false), en('a', false), en('b', false) ],
        [ en('a', false), en('a', false), en('a', false) ],
        [ en('c', false), en('a', false), en('i', false) ],
        [ en('?_0', true), en('a', false), en('i', false) ]
      ],
      [
        [ en('a', false), en('a', false), en('b', false) ],
        [ en('a', false), en('a', false), en('a', false) ],
        [ en('c', false), en('a', false), en('i', false) ]
      ], 2, 0
    );
    // splitting a cell which is already merged
    checkBody(
      [
        [ en('a', false), en('a', false), en('a', false) ],
        [ en('a', false), en('a', false), en('a', false) ],
        [ en('a', false), en('?_0', true), en('a', false) ],
        [ en('a', false), en('a', false), en('a', false) ]
      ],
      [
        [ en('a', false), en('a', false), en('a', false) ],
        [ en('a', false), en('a', false), en('a', false) ],
        [ en('a', false), en('a', false), en('a', false) ]
      ], 1, 1
    );

    check(
      [
        r([ en('a', false), en('b', false) ], 'thead'),
        r([ en('a', false), en('?_0', true) ], 'thead'),
        r([ en('c', false), en('d', false) ], 'tbody')
      ],
      [
        r([ en('a', false), en('b', false) ], 'thead'),
        r([ en('c', false), en('d', false) ], 'tbody')
      ], 0, 1
    );
  })();
});
