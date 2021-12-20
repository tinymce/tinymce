import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarElement, SugarNode, TextContent } from '@ephox/sugar';
import { assert } from 'chai';

import { Generators } from 'ephox/snooker/api/Generators';
import * as Structs from 'ephox/snooker/api/Structs';
import { TableSection } from 'ephox/snooker/api/TableSection';
import * as TransformOperations from 'ephox/snooker/operate/TransformOperations';
import * as MockStructs from 'ephox/snooker/test/MockStructs';
import TestGenerator from 'ephox/snooker/test/TestGenerator';

UnitTest.test('TransformOperationsTest', () => {
  const originalElements: Structs.ElementNew[] = [];
  const expectedElements: Structs.ElementNew[] = [];

  const clearElements = () => {
    originalElements.length = 0;
    expectedElements.length = 0;
  };

  const en = (elements: Structs.ElementNew[]) => (text: string, isNew: boolean, elemType: 'td' | 'th' | 'col' = 'td', isLocked: boolean = false) => {
    const elementNew = MockStructs.getElementNew(elements, elemType, text, isNew, isLocked);
    elements.push(elementNew);
    return elementNew;
  };

  // Expected
  const enE = en(expectedElements);
  // Actual
  const enO = en(originalElements);

  const mapToStructGrid = (grid: Structs.ElementNew[][]) => {
    return Arr.map(grid, (row) => {
      const hasCol = Arr.exists(row, (elementNew) => SugarNode.isTag('col')(elementNew.element));
      if (hasCol) {
        return Structs.rowcells(SugarElement.fromTag('colgroup'), row as Structs.ElementNew<HTMLTableColElement>[], 'colgroup', false);
      } else {
        return Structs.rowcells(SugarElement.fromTag('tr'), row as Structs.ElementNew<HTMLTableCellElement>[], 'tbody', false);
      }
    });
  };

  const assertGrids = (actual: Structs.RowCells[], expected: Structs.RowCells[]) => {
    assert.lengthOf(actual, expected.length);
    Arr.each(expected, (row, i) => {
      Arr.each(row.cells, (cell, j) => {
        const actualCell = actual[i].cells[j];
        assert.equal(TextContent.get(actualCell.element), TextContent.get(cell.element));
        assert.equal(actualCell.isNew, cell.isNew, `${i}x${j} cell is new`);
      });
      assert.equal(actual[i].section, row.section);
    });
  };

  const comparator = (a: SugarElement<Node>, b: SugarElement<Node>) => TextContent.get(a) === TextContent.get(b);

  // Test basic changing to header (column)
  (() => {
    const check = (expected: Structs.ElementNew[][], grid: Structs.ElementNew[][], index: number) => {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      const substitution = Generators.transform('td')(TestGenerator()).replaceOrInit;
      const actual = TransformOperations.replaceColumn(structGrid, index, true, comparator, substitution);
      assertGrids(actual, structExpected);
      clearElements();
    };

    check([
      [ enO('h(a)_0', true) ]
    ], [
      [ enE('a', false) ]
    ], 0);

    // should not modify col elements
    check([
      [ enE('a', false, 'col'), enE('b', false, 'col') ],
      [ enE('h(c)_0', true), enE('d', false) ],
    ], [
      [ enO('a', false, 'col'), enO('b', false, 'col') ],
      [ enO('c', false), enO('d', false) ],
    ], 0);

    check([
      [ enE('a', false), enE('a', false), enE('a', false) ],
      [ enE('b', false), enE('h(c)_0', true), enE('d', false) ],
      [ enE('e', false), enE('h(f)_1', true), enE('h(f)_1', true) ]
    ], [
      [ enO('a', false), enO('a', false), enO('a', false) ],
      [ enO('b', false), enO('c', false), enO('d', false) ],
      [ enO('e', false), enO('f', false), enO('f', false) ]
    ], 1);

    check([
      [ enE('a', false), enE('a', false), enE('a', false) ],
      [ enE('b', false), enE('h(c)_0', true), enE('d', false) ],
      [ enE('f', false), enE('f', false), enE('f', false) ]
    ], [
      [ enO('a', false), enO('a', false), enO('a', false) ],
      [ enO('b', false), enO('c', false), enO('d', false) ],
      [ enO('f', false), enO('f', false), enO('f', false) ]
    ], 1);

    check([
      [ enE('h(a)_0', true), enE('h(a)_0', true), enE('h(a)_0', true) ],
      [ enE('h(b)_1', true), enE('c', false), enE('d', false) ],
      [ enE('h(f)_2', true), enE('h(f)_2', true), enE('h(f)_2', true) ]
    ], [
      [ enO('a', false), enO('a', false), enO('a', false) ],
      [ enO('b', false), enO('c', false), enO('d', false) ],
      [ enO('f', false), enO('f', false), enO('f', false) ]
    ], 0);

    check([
      [ enE('h(a)_0', true), enE('h(a)_0', true), enE('h(a)_0', true) ],
      [ enE('h(a)_0', true), enE('h(a)_0', true), enE('h(a)_0', true) ],
      [ enE('h(b)_1', true), enE('c', false), enE('d', false) ],
      [ enE('h(f)_2', true), enE('h(f)_2', true), enE('h(f)_2', true) ]
    ], [
      [ enO('a', false), enO('a', false), enO('a', false) ],
      [ enO('a', false), enO('a', false), enO('a', false) ],
      [ enO('b', false), enO('c', false), enO('d', false) ],
      [ enO('f', false), enO('f', false), enO('f', false) ]
    ], 0);

    check([
      [ enE('a', false, 'th'), enE('a', false, 'th'), enE('b', false, 'th') ],
      [ enE('h(c)_0', true), enE('d', false), enE('e', false) ],
      [ enE('h(f)_1', true), enE('h(f)_1', true), enE('h(f)_1', true) ]
    ], [
      [ enO('a', false, 'th'), enO('a', false, 'th'), enO('b', false, 'th') ],
      [ enO('c', false), enO('d', false), enO('e', false) ],
      [ enO('f', false), enO('f', false), enO('f', false) ]
    ], 0);
  })();

  // Test basic changing to header (row)
  (() => {
    const check = (expected: Structs.ElementNew[][], grid: Structs.ElementNew[][], index: number) => {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      const substitution = Generators.transform('td')(TestGenerator()).replaceOrInit;
      const actual = TransformOperations.replaceRow(structGrid, index, 'tbody', true, comparator, substitution, TableSection.fallback());
      assertGrids(actual, structExpected);
      clearElements();
    };

    check([[]], [[]], 0);

    check([
      [ enE('h(a)_0', true) ]
    ], [
      [ enO('a', false) ]
    ], 0);

    check([
      [ enE('a', false), enE('b', false), enE('e', false) ],
      [ enE('a', false), enE('h(c)_0', true), enE('h(f)_1', true) ],
      [ enE('a', false), enE('d', false), enE('h(f)_1', true) ]
    ], [
      [ enO('a', false), enO('b', false), enO('e', false) ],
      [ enO('a', false), enO('c', false), enO('f', false) ],
      [ enO('a', false), enO('d', false), enO('f', false) ]
    ], 1);

    check([
      [ enE('a', false), enE('b', false), enE('f', false) ],
      [ enE('a', false), enE('h(c)_0', true), enE('f', false) ],
      [ enE('a', false), enE('d', false), enE('f', false) ]
    ], [
      [ enO('a', false), enO('b', false), enO('f', false) ],
      [ enO('a', false), enO('c', false), enO('f', false) ],
      [ enO('a', false), enO('d', false), enO('f', false) ]
    ], 1);

    check([
      [ enE('h(a)_0', true), enE('h(b)_1', true), enE('h(f)_2', true) ],
      [ enE('h(a)_0', true), enE('c', false), enE('h(f)_2', true) ],
      [ enE('h(a)_0', true), enE('d', false), enE('h(f)_2', true) ]
    ], [
      [ enO('a', false), enO('b', false), enO('f', false) ],
      [ enO('a', false), enO('c', false), enO('f', false) ],
      [ enO('a', false), enO('d', false), enO('f', false) ]
    ], 0);

    check([
      [ enE('h(a)_0', true), enE('h(a)_0', true), enE('h(b)_1', true), enE('h(f)_2', true) ],
      [ enE('h(a)_0', true), enE('h(a)_0', true), enE('c', false), enE('h(f)_2', true) ],
      [ enE('h(a)_0', true), enE('h(a)_0', true), enE('d', false), enE('h(f)_2', true) ]
    ], [
      [ enO('a', false), enO('a', false), enO('b', false), enO('f', false) ],
      [ enO('a', false), enO('a', false), enO('c', false), enO('f', false) ],
      [ enO('a', false), enO('a', false), enO('d', false), enO('f', false) ]
    ], 0);

    check([
      [ enE('h(a)_0', true), enE('h(a)_0', true), enE('h(b)_1', true), enE('f', false, 'th') ],
      [ enE('h(a)_0', true), enE('h(a)_0', true), enE('c', false), enE('f', false, 'th') ],
      [ enE('h(a)_0', true), enE('h(a)_0', true), enE('d', false), enE('f', false, 'th') ]
    ], [
      [ enO('a', false), enO('a', false), enO('b', false), enO('f', false, 'th') ],
      [ enO('a', false), enO('a', false), enO('c', false), enO('f', false, 'th') ],
      [ enO('a', false), enO('a', false), enO('d', false), enO('f', false, 'th') ]
    ], 0);
  })();

  // Test basic changing to header (cell)
  (() => {
    const check = (expected: Structs.ElementNew[][], grid: Structs.ElementNew[][], rowIndex: number, colIndex: number) => {
      const structExpected = mapToStructGrid(expected);
      const structGrid = mapToStructGrid(grid);
      const detail = { row: rowIndex, column: colIndex } as Structs.DetailExt;
      const actual = TransformOperations.replaceCell(structGrid, detail, comparator, Generators.transform('td')(TestGenerator()).replaceOrInit);
      assertGrids(actual, structExpected);
      clearElements();
    };

    check([[]], [[]], 0, 0);

    check([
      [ enE('h(a)_0', true) ]
    ], [
      [ enO('a', false) ]
    ], 0, 0);

    check([
      [ enE('a', false), enE('b', false), enE('e', false) ],
      [ enE('a', false), enE('h(c)_0', true), enE('f', false) ],
      [ enE('a', false), enE('d', false), enE('f', false) ]
    ], [
      [ enO('a', false), enO('b', false), enO('e', false) ],
      [ enO('a', false), enO('c', false), enO('f', false) ],
      [ enO('a', false), enO('d', false), enO('f', false) ]
    ], 1, 1);

    check([
      [ enE('a', false), enE('b', false), enE('e', false) ],
      [ enE('a', false), enE('c', false), enE('h(f)_0', true) ],
      [ enE('a', false), enE('d', false), enE('h(f)_0', true) ]
    ], [
      [ enO('a', false), enO('b', false), enO('e', false) ],
      [ enO('a', false), enO('c', false), enO('f', false) ],
      [ enO('a', false), enO('d', false), enO('f', false) ]
    ], 1, 2);
  })();
});
