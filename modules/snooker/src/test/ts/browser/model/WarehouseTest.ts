import { describe, it } from '@ephox/bedrock-client';
import { Obj, Type } from '@ephox/katamari';
import { Attribute, SugarElement, TextContent } from '@ephox/sugar';
import { assert } from 'chai';

import * as Structs from 'ephox/snooker/api/Structs';
import { Warehouse } from 'ephox/snooker/api/Warehouse';

interface ExpectedWarehouse {
  readonly access: Record<string, string>;
  readonly grid: Structs.Grid;
  readonly columns?: Record<string, string>;
}

describe('WarehouseTest', () => {
  const check = (input: Structs.RowDetail<Structs.Detail>[], expectedWarehouse: ExpectedWarehouse) => {
    const actual = Warehouse.generate(input);
    assert.deepEqual(Obj.map(actual.access, (x) => TextContent.get(x.element)), expectedWarehouse.access);
    assert.deepEqual(actual.grid, expectedWarehouse.grid);
    if (Type.isNonNullable(expectedWarehouse.columns)) {
      // Expect only 1 colgroup in a colgroup table
      assert.lengthOf(actual.colgroups, 1);
      assert.deepEqual(Obj.map(actual.columns, (x) => Attribute.get(x.element, 'data-id')), expectedWarehouse.columns);
      assert.isAtMost(Obj.keys(actual.columns).length, actual.grid.columns);
    } else {
      assert.isEmpty(actual.columns);
      assert.isEmpty(actual.colgroups);
    }
  };

  const createCell = (text: string): SugarElement<HTMLTableCellElement> => {
    const elem = SugarElement.fromTag('td');
    TextContent.set(elem, text);
    return elem;
  };

  const createCol = (id: string): SugarElement<HTMLTableColElement> => {
    const elem = SugarElement.fromTag('col');
    Attribute.set(elem, 'data-id', id);
    return elem;
  };

  const s = (elemText: string, rowspan: number, colspan: number) => Structs.detail(createCell(elemText), rowspan, colspan);
  const f = (cells: Structs.Detail<HTMLTableCellElement>[], section: 'tbody' | 'thead' | 'tfoot') => Structs.rowdetail(SugarElement.fromTag('tr'), cells, section);
  const c = (id: string, colspan: number) => Structs.detail(createCol(id), 1, colspan);
  const cg = (cols: Structs.Detail<HTMLTableColElement>[]) => Structs.rowdetail(SugarElement.fromTag('colgroup'), cols, 'colgroup');

  const testTable = [
    f([ s('a', 1, 2), s('b', 1, 1), s('c', 1, 1), s('d', 1, 1), s('e', 1, 1), s('f', 1, 1) ], 'thead'),
    f([ s('g', 1, 1), s('h', 1, 1), s('i', 1, 1), s('j', 1, 1), s('k', 1, 3) ], 'tbody'),
    f([ s('l', 1, 1), s('m', 3, 2), s('n', 1, 1), s('o', 1, 1), s('p', 1, 1), s('q', 1, 1) ], 'tfoot'),
    f([ s('r', 2, 1), s('s', 1, 1), s('t', 2, 1), s('u', 1, 1), s('v', 1, 1) ], 'tfoot'),
    f([ s('w', 1, 1), s('x', 1, 1), s('y', 1, 1) ], 'tfoot')
  ];

  it('standard table', () => {
    check(testTable, {
      access: {
        '0,0': 'a',
        '0,1': 'a',
        '0,2': 'b',
        '0,3': 'c',
        '0,4': 'd',
        '0,5': 'e',
        '0,6': 'f',
        '1,0': 'g',
        '1,1': 'h',
        '1,2': 'i',
        '1,3': 'j',
        '1,4': 'k',
        '1,5': 'k',
        '1,6': 'k',
        '2,0': 'l',
        '2,1': 'm',
        '2,2': 'm',
        '2,3': 'n',
        '2,4': 'o',
        '2,5': 'p',
        '2,6': 'q',
        '3,0': 'r',
        '3,1': 'm',
        '3,2': 'm',
        '3,3': 's',
        '3,4': 't',
        '3,5': 'u',
        '3,6': 'v',
        '4,0': 'r',
        '4,1': 'm',
        '4,2': 'm',
        '4,3': 'w',
        '4,4': 't',
        '4,5': 'x',
        '4,6': 'y'
      },
      grid: {
        rows: 5,
        columns: 7
      }
    });
  });

  it('colgroup table', () => {
    check(
      [
        cg([ c('a', 1), c('b', 1), c('c', 1) ]),
        f([ s('a', 1, 1), s('b', 1, 1), s('c', 1, 1) ], 'tbody')
      ],
      {
        access: {
          '0,0': 'a',
          '0,1': 'b',
          '0,2': 'c',
        },
        grid: {
          rows: 1,
          columns: 3
        },
        columns: {
          0: 'a',
          1: 'b',
          2: 'c'
        }
      });
  });

  it('colspan cell', () => {
    check(
      [
        f([ s('a', 1, 3) ], 'tbody')
      ],
      {
        access: {
          '0,0': 'a',
          '0,1': 'a',
          '0,2': 'a'
        },
        grid: {
          rows: 1,
          columns: 3
        }
      });
  });

  it('span col', () => {
    check(
      [
        cg([ c('a', 3) ]),
        f([ s('a', 1, 1), s('b', 1, 1), s('c', 1, 1) ], 'tbody')
      ],
      {
        access: {
          '0,0': 'a',
          '0,1': 'b',
          '0,2': 'c',
        },
        grid: {
          rows: 1,
          columns: 3
        },
        columns: {
          0: 'a',
          1: 'a',
          2: 'a'
        }
      });
  });
});
