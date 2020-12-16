import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { Generators } from 'ephox/snooker/api/Generators';
import * as Structs from 'ephox/snooker/api/Structs';
import * as TransformOperations from 'ephox/snooker/operate/TransformOperations';
import TestGenerator from 'ephox/snooker/test/TestGenerator';

UnitTest.test('TransformOperationsTest', () => {
  const en = (fakeElement: any, isNew: boolean) => Structs.elementnew(fakeElement as SugarElement, isNew);

  const mapToStructGrid = (grid: Structs.ElementNew[][]) => {
    return Arr.map(grid, (row) => {
      return Structs.rowcells(row, 'tbody');
    });
  };

  const assertGrids = (expected: Structs.RowCells[], actual: Structs.RowCells[]) => {
    assert.eq(expected.length, actual.length);
    Arr.each(expected, (row, i) => {
      Arr.each(row.cells, (cell, j) => {
        assert.eq(cell.element, actual[i].cells[j].element);
        assert.eq(cell.isNew, actual[i].cells[j].isNew);
      });
      assert.eq(row.section, actual[i].section);
    });
  };

  // Test basic changing to header (column)
  (() => {
    const check = (expected: Structs.ElementNew[][], grid: Structs.ElementNew[][], index: number) => {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      const actual = TransformOperations.replaceColumn(structGrid, index, Fun.tripleEquals, Generators.transform('scope', 'td')(TestGenerator()).replaceOrInit);
      assertGrids(structExpected, actual);
    };

    check([
      [ en('h(a)_0', true) ]
    ], [
      [ en('a', false) ]
    ], 0);

    check([
      [ en('a', false), en('a', false), en('a', false) ],
      [ en('b', false), en('h(c)_0', true), en('d', false) ],
      [ en('e', false), en('h(f)_1', true), en('h(f)_1', true) ]
    ], [
      [ en('a', false), en('a', false), en('a', false) ],
      [ en('b', false), en('c', false), en('d', false) ],
      [ en('e', false), en('f', false), en('f', false) ]
    ], 1);

    check([
      [ en('a', false), en('a', false), en('a', false) ],
      [ en('b', false), en('h(c)_0', true), en('d', false) ],
      [ en('f', false), en('f', false), en('f', false) ]
    ], [
      [ en('a', false), en('a', false), en('a', false) ],
      [ en('b', false), en('c', false), en('d', false) ],
      [ en('f', false), en('f', false), en('f', false) ]
    ], 1);

    check([
      [ en('h(a)_0', true), en('h(a)_0', true), en('h(a)_0', true) ],
      [ en('h(b)_1', true), en('c', false), en('d', false) ],
      [ en('h(f)_2', true), en('h(f)_2', true), en('h(f)_2', true) ]
    ], [
      [ en('a', false), en('a', false), en('a', false) ],
      [ en('b', false), en('c', false), en('d', false) ],
      [ en('f', false), en('f', false), en('f', false) ]
    ], 0);

    check([
      [ en('h(a)_0', true), en('h(a)_0', true), en('h(a)_0', true) ],
      [ en('h(a)_0', true), en('h(a)_0', true), en('h(a)_0', true) ],
      [ en('h(b)_1', true), en('c', false), en('d', false) ],
      [ en('h(f)_2', true), en('h(f)_2', true), en('h(f)_2', true) ]
    ], [
      [ en('a', false), en('a', false), en('a', false) ],
      [ en('a', false), en('a', false), en('a', false) ],
      [ en('b', false), en('c', false), en('d', false) ],
      [ en('f', false), en('f', false), en('f', false) ]
    ], 0);
  })();

  // Test basic changing to header (row)
  (() => {
    const check = (expected: Structs.ElementNew[][], grid: Structs.ElementNew[][], index: number) => {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      const actual = TransformOperations.replaceRow(structGrid, index, Fun.tripleEquals, Generators.transform('scope', 'td')(TestGenerator()).replaceOrInit);
      assertGrids(structExpected, actual);
    };

    check([[]], [[]], 0);
    check([
      [ en('h(a)_0', true) ]
    ], [
      [ en('a', false) ]
    ], 0);

    check([
      [ en('a', false), en('b', false), en('e', false) ],
      [ en('a', false), en('h(c)_0', true), en('h(f)_1', true) ],
      [ en('a', false), en('d', false), en('h(f)_1', true) ]
    ], [
      [ en('a', false), en('b', false), en('e', false) ],
      [ en('a', false), en('c', false), en('f', false) ],
      [ en('a', false), en('d', false), en('f', false) ]
    ], 1);

    check([
      [ en('a', false), en('b', false), en('f', false) ],
      [ en('a', false), en('h(c)_0', true), en('f', false) ],
      [ en('a', false), en('d', false), en('f', false) ]
    ], [
      [ en('a', false), en('b', false), en('f', false) ],
      [ en('a', false), en('c', false), en('f', false) ],
      [ en('a', false), en('d', false), en('f', false) ]
    ], 1);

    check([
      [ en('h(a)_0', true), en('h(b)_1', true), en('h(f)_2', true) ],
      [ en('h(a)_0', true), en('c', false), en('h(f)_2', true) ],
      [ en('h(a)_0', true), en('d', false), en('h(f)_2', true) ]
    ], [
      [ en('a', false), en('b', false), en('f', false) ],
      [ en('a', false), en('c', false), en('f', false) ],
      [ en('a', false), en('d', false), en('f', false) ]
    ], 0);

    check([
      [ en('h(a)_0', true), en('h(a)_0', true), en('h(b)_1', true), en('h(f)_2', true) ],
      [ en('h(a)_0', true), en('h(a)_0', true), en('c', false), en('h(f)_2', true) ],
      [ en('h(a)_0', true), en('h(a)_0', true), en('d', false), en('h(f)_2', true) ]
    ], [
      [ en('a', false), en('a', false), en('b', false), en('f', false) ],
      [ en('a', false), en('a', false), en('c', false), en('f', false) ],
      [ en('a', false), en('a', false), en('d', false), en('f', false) ]
    ], 0);
  })();
});
