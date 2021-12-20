import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as Structs from 'ephox/snooker/api/Structs';
import * as TableGrid from 'ephox/snooker/model/TableGrid';

describe('TableGridTest', () => {
  const r = Structs.rowcells;
  const re = () => 'row' as unknown as SugarElement<any>;
  const ce = () => 'colgroup' as unknown as SugarElement<any>;
  const en = (fakeElement: any, isNew: boolean) => Structs.elementnew(fakeElement as SugarElement<any>, isNew, false);

  const check = (expected: { colspan: number; rowspan: number }, row: number, column: number, grid: Structs.RowCells[]) => {
    const actual = TableGrid.subgrid(grid, row, column, Fun.tripleEquals);
    assert.deepEqual(actual, expected);
  };

  const world = [
    r(ce(), [ en('f', false), en('g', false), en('g', false) ], 'colgroup', false),
    r(re(), [ en('a', false), en('a', false), en('a', false) ], 'thead', false),
    r(re(), [ en('b', false), en('b', false), en('c', false) ], 'tbody', false),
    r(re(), [ en('d', false), en('e', false), en('c', false) ], 'tfoot', false)
  ];

  it('check cols', () => {
    check({ colspan: 1, rowspan: 1 }, 0, 0, world);
    check({ colspan: 2, rowspan: 1 }, 0, 1, world);
  });

  it('check cells', () => {
    check({ colspan: 3, rowspan: 1 }, 1, 0, world);
    check({ colspan: 2, rowspan: 1 }, 1, 1, world);
    check({ colspan: 2, rowspan: 1 }, 2, 0, world);
    check({ colspan: 1, rowspan: 1 }, 3, 0, world);
    check({ colspan: 1, rowspan: 2 }, 2, 2, world);
  });
});
