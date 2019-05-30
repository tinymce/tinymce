import { assert, UnitTest } from '@ephox/bedrock';
import { Arr, Fun } from '@ephox/katamari';
import Structs from 'ephox/snooker/api/Structs';
import Transitions from 'ephox/snooker/model/Transitions';

UnitTest.test('TableCounterTest', function () {
  const d = Structs.detail;
  const r = Structs.rowcells;
  const rd = Structs.rowdetails;
  const en = Structs.elementnew;

  const check = function (expected, input) {
    const actual = Transitions.toDetails(input, Fun.tripleEquals);
    const cleaner = function (obj) {
      return Arr.map(obj, function (row) {
        return Arr.map(row, function (c) {
          return { element: c.element(), rowspan: c.rowspan(), colspan: c.colspan() };
        });
      });
    };
    assert.eq(cleaner(expected), cleaner(actual));
  };

  check(
    [
      rd([ d(en('td1', false), 1, 3), d(en('td2', false), 1, 1), d(en('td3', false), 1, 1) ], 'tbody')
    ],
    [
      r([ en('td1', false), en('td1', false), en('td1', false), en('td2', false), en('td3', false) ], 'tbody')
    ]
  );

  check(
    [
      rd([ d(en('td1', false), 1, 3), d(en('td2', false), 1, 1), d(en('td3', false), 1, 1) ], 'thead')
    ],
    [
      r([ en('td1', false), en('td1', false), en('td1', false), en('td2', false), en('td3', false) ], 'thead')
    ]
  );

  check(
    [
      rd([ d(en('td1', false), 4, 3) ], 'tbody'),
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
      rd([ d(en('td1', false), 4, 3) ], 'tfoot'),
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
      rd([ d(en('td1', false), 2, 3) ], 'tbody'),
      rd([ ], 'tbody')
    ],
    [
      r([ en('td1', false), en('td1', false), en('td1', false) ], 'tbody'),
      r([ en('td1', false), en('td1', false), en('td1', false) ], 'tbody')
    ]
  );

  check(
    [
      rd([ d(en('td1', false), 1, 1) ], 'thead'),
      rd([ d(en('td2', false), 1, 1) ], 'tbody'),
      rd([ d(en('td3', false), 1, 1) ], 'tfoot')
    ],
    [
      r([ en('td1', false) ], 'thead'),
      r([ en('td2', false) ], 'tbody'),
      r([ en('td3', false) ], 'tfoot')
    ]
  );

  check(
    [
      rd([ d(en('td1', false), 2, 2), d(en('td3', false), 1, 1) ], 'tbody'),
      rd([ d(en('td4', false), 1, 1) ], 'tbody')
    ],
    [
      r([ en('td1', false), en('td1', false), en('td3', false) ], 'tbody'),
      r([ en('td1', false), en('td1', false), en('td4', false) ], 'tbody')
    ]
  );

  check(
    [
      rd([ d(en('td1', false), 2, 2), d(en('td3', false), 1, 1) ], 'tbody'),
      rd([ d(en('td4', false), 2, 1) ], 'tbody'),
      rd([ d(en('td2', false), 1, 2) ], 'tbody'),
      rd([ d(en('td5', false), 1, 1), d(en('td6', false), 1, 2) ], 'tbody')
    ],
    [
      r([ en('td1', false), en('td1', false), en('td3', false) ], 'tbody'),
      r([ en('td1', false), en('td1', false), en('td4', false) ], 'tbody'),
      r([ en('td2', false), en('td2', false), en('td4', false) ], 'tbody'),
      r([ en('td5', false), en('td6', false), en('td6', false) ], 'tbody')
    ]
  );
});
