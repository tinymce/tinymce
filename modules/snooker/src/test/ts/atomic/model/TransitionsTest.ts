import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Structs from 'ephox/snooker/api/Structs';
import * as Transitions from 'ephox/snooker/model/Transitions';

UnitTest.test('TableCounterTest', () => {
  const dn = (fakeElement: any, rowspan: number, colspan: number, isNew: boolean) => Structs.detailnew(fakeElement as SugarElement, rowspan, colspan, isNew);
  const r = Structs.rowcells;
  const rd = Structs.rowdetailnew;
  const re = () => 'row' as unknown as SugarElement;
  const en = (fakeElement: any, isNew: boolean) => Structs.elementnew(fakeElement as SugarElement, isNew, false);

  const check = (expected: Structs.RowDetailNew<Structs.DetailNew>[], input: Structs.RowCells[]) => {
    const actual = Transitions.toDetails(input, Fun.tripleEquals);
    const cleaner = (obj: Structs.RowDetailNew<Structs.DetailNew>[]) => {
      return Arr.map(obj, (row) => row.cells);
    };
    assert.eq(cleaner(expected), cleaner(actual));
  };

  check(
    [
      rd(re(), [ dn('td1', 1, 3, false), dn('td2', 1, 1, false), dn('td3', 1, 1, false) ], 'tbody', false)
    ],
    [
      r(re(), [ en('td1', false), en('td1', false), en('td1', false), en('td2', false), en('td3', false) ], 'tbody', false)
    ]
  );

  check(
    [
      rd(re(), [ dn('td1', 1, 3, false), dn('td2', 1, 1, false), dn('td3', 1, 1, false) ], 'thead', false)
    ],
    [
      r(re(), [ en('td1', false), en('td1', false), en('td1', false), en('td2', false), en('td3', false) ], 'thead', false)
    ]
  );

  check(
    [
      rd(re(), [ dn('td1', 4, 3, false) ], 'tbody', false),
      rd(re(), [ ], 'tbody', false),
      rd(re(), [ ], 'tbody', false),
      rd(re(), [ ], 'tbody', false)
    ],
    [
      r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tbody', false),
      r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tbody', false),
      r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tbody', false),
      r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tbody', false)
    ]
  );

  check(
    [
      rd(re(), [ dn('td1', 4, 3, false) ], 'tfoot', false),
      rd(re(), [ ], 'tfoot', false),
      rd(re(), [ ], 'tfoot', false),
      rd(re(), [ ], 'tfoot', false)
    ],
    [
      r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tfoot', false),
      r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tfoot', false),
      r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tfoot', false),
      r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tfoot', false)
    ]
  );

  check(
    [
      rd(re(), [ dn('td1', 2, 3, false) ], 'tbody', false),
      rd(re(), [ ], 'tbody', false)
    ],
    [
      r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tbody', false),
      r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tbody', false)
    ]
  );

  check(
    [
      rd(re(), [ dn('td1', 1, 1, false) ], 'thead', false),
      rd(re(), [ dn('td2', 1, 1, false) ], 'tbody', false),
      rd(re(), [ dn('td3', 1, 1, false) ], 'tfoot', false)
    ],
    [
      r(re(), [ en('td1', false) ], 'thead', false),
      r(re(), [ en('td2', false) ], 'tbody', false),
      r(re(), [ en('td3', false) ], 'tfoot', false)
    ]
  );

  check(
    [
      rd(re(), [ dn('td1', 2, 2, false), dn('td3', 1, 1, false) ], 'tbody', false),
      rd(re(), [ dn('td4', 1, 1, false) ], 'tbody', false)
    ],
    [
      r(re(), [ en('td1', false), en('td1', false), en('td3', false) ], 'tbody', false),
      r(re(), [ en('td1', false), en('td1', false), en('td4', false) ], 'tbody', false)
    ]
  );

  check(
    [
      rd(re(), [ dn('td1', 2, 2, false), dn('td3', 1, 1, false) ], 'tbody', false),
      rd(re(), [ dn('td4', 2, 1, false) ], 'tbody', false),
      rd(re(), [ dn('td2', 1, 2, false) ], 'tbody', false),
      rd(re(), [ dn('td5', 1, 1, false), dn('td6', 1, 2, false) ], 'tbody', false)
    ],
    [
      r(re(), [ en('td1', false), en('td1', false), en('td3', false) ], 'tbody', false),
      r(re(), [ en('td1', false), en('td1', false), en('td4', false) ], 'tbody', false),
      r(re(), [ en('td2', false), en('td2', false), en('td4', false) ], 'tbody', false),
      r(re(), [ en('td5', false), en('td6', false), en('td6', false) ], 'tbody', false)
    ]
  );
});
