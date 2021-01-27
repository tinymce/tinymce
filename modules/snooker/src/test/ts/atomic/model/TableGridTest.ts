import { assert, UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import * as Structs from 'ephox/snooker/api/Structs';
import * as TableGrid from 'ephox/snooker/model/TableGrid';

UnitTest.test('TableGrid.subgrid test', () => {
  const r = Structs.rowcells;
  const en = (fakeElement: any, isNew: boolean) => Structs.elementnew(fakeElement as SugarElement, isNew, false);

  const check = (expected: { colspan: number; rowspan: number }, row: number, column: number, grid: Structs.RowCells[]) => {
    const actual = TableGrid.subgrid(grid, row, column, Fun.tripleEquals);
    assert.eq(expected.rowspan, actual.rowspan);
    assert.eq(expected.colspan, actual.colspan);
  };

  const world = [
    r([ en('a', false), en('a', false), en('a', false) ], 'thead'),
    r([ en('b', false), en('b', false), en('c', false) ], 'tbody'),
    r([ en('d', false), en('e', false), en('c', false) ], 'tfoot')
  ];

  check({ colspan: 3, rowspan: 1 }, 0, 0, world);
  check({ colspan: 2, rowspan: 1 }, 0, 1, world);
  check({ colspan: 2, rowspan: 1 }, 1, 0, world);
  check({ colspan: 1, rowspan: 1 }, 2, 0, world);
});
