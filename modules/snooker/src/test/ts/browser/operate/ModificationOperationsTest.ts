import { Assertions } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Html, SugarElement, SugarNode } from '@ephox/sugar';

import { Generators } from 'ephox/snooker/api/Generators';
import * as Structs from 'ephox/snooker/api/Structs';
import * as ModificationOperations from 'ephox/snooker/operate/ModificationOperations';
import BrowserTestGenerator from 'ephox/snooker/test/BrowserTestGenerator';

type Grid = Structs.ElementNew<HTMLTableCellElement>[][];

UnitTest.test('ModificationOperationsTest', () => {
  const r = Structs.rowcells;
  const re = () => SugarElement.fromTag('tr');
  const en = (content: string, isNew: boolean) => {
    const elem = SugarElement.fromTag('td');
    Html.set(elem, content);
    return Structs.elementnew(elem, isNew, false);
  };
  const mapToStructGrid = (grid: Grid) => {
    return Arr.map(grid, (row) => {
      return Structs.rowcells(re(), row, 'tbody', false);
    });
  };

  const assertGrids = (expected: Structs.RowCells[], actual: Structs.RowCells[], checkIsNew: boolean) => {
    Assert.eq('', expected.length, actual.length);
    Arr.each(expected, (row, i) => {
      Arr.each(row.cells, (cell, j) => {
        Assertions.assertHtml('Expected elements to have the same HTML', Html.getOuter(cell.element), Html.getOuter(actual[i].cells[j].element));
        Assert.eq('', cell.isNew, actual[i].cells[j].isNew);
      });
      Assert.eq('section type', row.section, actual[i].section);
      if (checkIsNew) {
        Assert.eq('is new row', row.isNew, actual[i].isNew);
      }
    });
  };

  const compare = (a: SugarElement<HTMLElement>, b: SugarElement<HTMLElement>) =>
    SugarNode.name(a) === SugarNode.name(b) && Html.get(a) === Html.get(b);

  // Test basic insert column
  (() => {
    const check = (expected: Structs.RowCells[], grid: Structs.RowCells[], example: number, index: number, checkIsNew: boolean = true) => {
      const actual = ModificationOperations.insertColumnAt(grid, index, example, compare, Generators.modification(BrowserTestGenerator()).getOrInit);
      assertGrids(expected, actual, checkIsNew);
    };

    const checkBody = (expected: Grid, grid: Grid, example: number, index: number) => {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      check(structExpected, structGrid, example, index, false);
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
        r(re(), [ en('a', false), en('?_0', true) ], 'thead', false),
        r(re(), [ en('b', false), en('?_1', true) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false) ], 'thead', false),
        r(re(), [ en('b', false) ], 'tbody', false)
      ], 0, 1
    );

    check(
      [
        r(re(), [ en('?_0', true), en('a', false) ], 'thead', false),
        r(re(), [ en('?_1', true), en('b', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false) ], 'thead', false),
        r(re(), [ en('b', false) ], 'tbody', false)
      ], 0, 0
    );

    check(
      [
        r(re(), [ en('a', false), en('a', false), en('a', false) ], 'thead', false),
        r(re(), [ en('b', false), en('?_0', true), en('c', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('a', false) ], 'thead', false),
        r(re(), [ en('b', false), en('c', false) ], 'tbody', false)
      ], 0, 1
    );
  })();

  // Test basic insert row
  (() => {
    const check = (expected: Structs.RowCells[], grid: Structs.RowCells[], example: number, index: number, checkIsNew: boolean = true) => {
      const actual = ModificationOperations.insertRowAt(grid, index, example, compare, Generators.modification(BrowserTestGenerator()).getOrInit);
      assertGrids(expected, actual, checkIsNew);
    };

    const checkBody = (expected: Grid, grid: Grid, example: number, index: number) => {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      check(structExpected, structGrid, example, index, false);
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
        r(re(), [ en('a', false), en('b', false), en('c', false) ], 'thead', false),
        r(re(), [ en('?_0', true), en('?_1', true), en('?_2', true) ], 'thead', true),
        r(re(), [ en('d', false), en('e', false), en('f', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false), en('c', false) ], 'thead', false),
        r(re(), [ en('d', false), en('e', false), en('f', false) ], 'tbody', false)
      ], 0, 1);

    check(
      [
        r(re(), [ en('a', false), en('b', false), en('c', false) ], 'thead', false),
        r(re(), [ en('?_0', true), en('?_1', true), en('?_2', true) ], 'tbody', true),
        r(re(), [ en('d', false), en('e', false), en('f', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false), en('c', false) ], 'thead', false),
        r(re(), [ en('d', false), en('e', false), en('f', false) ], 'tbody', false)
      ], 1, 1);
  })();

  // Test basic delete column
  (() => {
    const check = (expected: Structs.RowCells[], grid: Structs.RowCells[], index: number, checkIsNew: boolean = true) => {
      const actual = ModificationOperations.deleteColumnsAt(grid, [ index ]);
      assertGrids(expected, actual, checkIsNew);
    };

    const checkBody = (expected: Grid, grid: Grid, index: number) => {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      check(structExpected, structGrid, index, false);
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
        r(re(), [ en('a', false), en('b', false) ], 'thead', false),
        r(re(), [ en('c', false), en('c', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false), en('b', false) ], 'thead', false),
        r(re(), [ en('c', false), en('c', false), en('c', false) ], 'tbody', false)
      ], 1);
  })();

  // Test delete multiple columns
  (() => {
    const check = (expected: Structs.RowCells[], grid: Structs.RowCells[], indexes: number[], checkIsNew: boolean = true) => {
      const actual = ModificationOperations.deleteColumnsAt(grid, indexes);
      assertGrids(expected, actual, checkIsNew);
    };

    const checkBody = (expected: Grid, grid: Grid, indexes: number[]) => {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      check(structExpected, structGrid, indexes, false);
    };

    checkBody([], [[ en('a', false), en('b', false) ]], [ 0, 1 ]);
    checkBody([[ en('b', false) ]], [[ en('a', false), en('b', false), en('c', false) ]], [ 0, 2 ]);
    checkBody(
      [
        [ en('a', false), en('c', false) ],
        [ en('c', false), en('c', false) ]
      ],
      [
        [ en('a', false), en('b', false), en('c', false) ],
        [ en('c', false), en('c', false), en('c', false) ]
      ], [ 1 ]);
    check(
      [
        r(re(), [ en('a', false) ], 'thead', false),
        r(re(), [ en('c', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false), en('c', false) ], 'thead', false),
        r(re(), [ en('c', false), en('c', false), en('c', false) ], 'tbody', false)
      ], [ 1, 2 ]);
  })();

  // Test basic delete row
  (() => {
    const check = (expected: Structs.RowCells[], grid: Structs.RowCells[], index: number, checkIsNew: boolean = true) => {
      const actual = ModificationOperations.deleteRowsAt(grid, index, index);
      assertGrids(expected, actual, checkIsNew);
    };

    const checkBody = (expected: Grid, grid: Grid, index: number) => {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      check(structExpected, structGrid, index, false);
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
        r(re(), [ en('a', false), en('b', false), en('b', false) ], 'thead', false),
        r(re(), [ en('c', false), en('c', false), en('c', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false), en('b', false) ], 'thead', false),
        r(re(), [ en('a', false), en('b', false), en('b', false) ], 'tbody', false),
        r(re(), [ en('c', false), en('c', false), en('c', false) ], 'tbody', false)
      ], 1);
  })();

  (() => {
    const check = (expected: Structs.RowCells[], grid: Structs.RowCells[], exRow: number, exCol: number, checkIsNew: boolean = true) => {
      const actual = ModificationOperations.splitCellIntoColumns(grid, exRow, exCol, Fun.tripleEquals, Generators.modification(BrowserTestGenerator()).getOrInit);
      assertGrids(expected, actual, checkIsNew);
    };

    const checkBody = (expected: Grid, grid: Grid, exRow: number, exCol: number) => {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      check(structExpected, structGrid, exRow, exCol, false);
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
        r(re(), [ en('a', false), en('b', false), en('c', false), en('?_0', true) ], 'thead', false),
        r(re(), [ en('d', false), en('e', false), en('e', false), en('e', false) ], 'tbody', false),
        r(re(), [ en('g', false), en('g', false), en('i', false), en('i', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false), en('c', false) ], 'thead', false),
        r(re(), [ en('d', false), en('e', false), en('e', false) ], 'tbody', false),
        r(re(), [ en('g', false), en('g', false), en('i', false) ], 'tbody', false)
      ], 0, 2
    );

    check(
      [
        r(re(), [ en('a', false), en('a', false), en('a', false), en('c', false) ], 'thead', false),
        r(re(), [ en('a', false), en('a', false), en('a', false), en('a', false) ], 'tbody', false),
        r(re(), [ en('g', false), en('?_0', true), en('h', false), en('i', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('a', false), en('c', false) ], 'thead', false),
        r(re(), [ en('a', false), en('a', false), en('a', false) ], 'tbody', false),
        r(re(), [ en('g', false), en('h', false), en('i', false) ], 'tbody', false)
      ], 2, 0
    );
  })();

  (() => {
    const check = (expected: Structs.RowCells[], grid: Structs.RowCells[], exRow: number, exCol: number, checkIsNew: boolean = true) => {
      const actual = ModificationOperations.splitCellIntoRows(grid, exRow, exCol, Fun.tripleEquals, Generators.modification(BrowserTestGenerator()).getOrInit);
      assertGrids(expected, actual, checkIsNew);
    };

    const checkBody = (expected: Grid, grid: Grid, exRow: number, exCol: number) => {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      check(structExpected, structGrid, exRow, exCol, false);
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
        r(re(), [ en('a', false), en('b', false) ], 'thead', false),
        r(re(), [ en('a', false), en('?_0', true) ], 'thead', true),
        r(re(), [ en('c', false), en('d', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false) ], 'thead', false),
        r(re(), [ en('c', false), en('d', false) ], 'tbody', false)
      ], 0, 1
    );
  })();
});
