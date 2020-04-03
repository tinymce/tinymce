import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import * as Structs from 'ephox/snooker/api/Structs';
import * as Transitions from 'ephox/snooker/model/Transitions';
import { Element } from '@ephox/sugar';

UnitTest.test('TableCounterTest', function () {
  const dn = (fakeElement: any, rowspan: number, colspan: number, isNew: boolean) => Structs.detailnew(fakeElement as Element, rowspan, colspan, isNew);
  const r = Structs.rowcells;
  const rd = Structs.rowdetails;
  const en = (fakeElement: any, isNew: boolean) => Structs.elementnew(fakeElement as Element, isNew);

  const check = function (expected: Structs.RowDetails[], input: Structs.RowCells[]) {
    const actual = Transitions.toDetails(input, Fun.tripleEquals);
    const cleaner = function (obj: Structs.RowDetails[]) {
      return Arr.map(obj, function (row) {
        return Arr.map(row.details(), function (c) {
          return { element: c.element(), rowspan: c.rowspan(), colspan: c.colspan() };
        });
      });
    };
    assert.eq(cleaner(expected), cleaner(actual));
  };

  check(
    [
      rd([ dn('td1', 1, 3, false), dn('td2', 1, 1, false), dn('td3', 1, 1, false) ], 'tbody')
    ],
    [
      r([ en('td1', false), en('td1', false), en('td1', false), en('td2', false), en('td3', false) ], 'tbody')
    ]
  );

  check(
    [
      rd([ dn('td1', 1, 3, false), dn('td2', 1, 1, false), dn('td3', 1, 1, false) ], 'thead')
    ],
    [
      r([ en('td1', false), en('td1', false), en('td1', false), en('td2', false), en('td3', false) ], 'thead')
    ]
  );

  check(
    [
      rd([ dn('td1', 4, 3, false) ], 'tbody'),
      rd([ ], 'tbody'),
      rd([ ], 'tbody'),
      rd([ ], 'tbody')
    ],
    [
      r([ en('td1', false), en('td1', false), en('td1', false) ], 'tbody'),
      r([ en('td1', false), en('td1', false), en('td1', false) ], 'tbody'),
      r([ en('td1', false), en('td1', false), en('td1', false) ], 'tbody'),
      r([ en('td1', false), en('td1', false), en('td1', false) ], 'tbody')
    ]
  );

  check(
    [
      rd([ dn('td1', 4, 3, false) ], 'tfoot'),
      rd([ ], 'tfoot'),
      rd([ ], 'tfoot'),
      rd([ ], 'tfoot')
    ],
    [
      r([ en('td1', false), en('td1', false), en('td1', false) ], 'tfoot'),
      r([ en('td1', false), en('td1', false), en('td1', false) ], 'tfoot'),
      r([ en('td1', false), en('td1', false), en('td1', false) ], 'tfoot'),
      r([ en('td1', false), en('td1', false), en('td1', false) ], 'tfoot')
    ]
  );

  check(
    [
      rd([ dn('td1', 2, 3, false) ], 'tbody'),
      rd([ ], 'tbody')
    ],
    [
      r([ en('td1', false), en('td1', false), en('td1', false) ], 'tbody'),
      r([ en('td1', false), en('td1', false), en('td1', false) ], 'tbody')
    ]
  );

  check(
    [
      rd([ dn('td1', 1, 1, false) ], 'thead'),
      rd([ dn('td2', 1, 1, false) ], 'tbody'),
      rd([ dn('td3', 1, 1, false) ], 'tfoot')
    ],
    [
      r([ en('td1', false) ], 'thead'),
      r([ en('td2', false) ], 'tbody'),
      r([ en('td3', false) ], 'tfoot')
    ]
  );

  check(
    [
      rd([ dn('td1', 2, 2, false), dn('td3', 1, 1, false) ], 'tbody'),
      rd([ dn('td4', 1, 1, false) ], 'tbody')
    ],
    [
      r([ en('td1', false), en('td1', false), en('td3', false) ], 'tbody'),
      r([ en('td1', false), en('td1', false), en('td4', false) ], 'tbody')
    ]
  );

  check(
    [
      rd([ dn('td1', 2, 2, false), dn('td3', 1, 1, false) ], 'tbody'),
      rd([ dn('td4', 2, 1, false) ], 'tbody'),
      rd([ dn('td2', 1, 2, false) ], 'tbody'),
      rd([ dn('td5', 1, 1, false), dn('td6', 1, 2, false) ], 'tbody')
    ],
    [
      r([ en('td1', false), en('td1', false), en('td3', false) ], 'tbody'),
      r([ en('td1', false), en('td1', false), en('td4', false) ], 'tbody'),
      r([ en('td2', false), en('td2', false), en('td4', false) ], 'tbody'),
      r([ en('td5', false), en('td6', false), en('td6', false) ], 'tbody')
    ]
  );
});
