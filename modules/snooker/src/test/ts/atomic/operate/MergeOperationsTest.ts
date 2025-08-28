import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Structs from 'ephox/snooker/api/Structs';
import * as MergingOperations from 'ephox/snooker/operate/MergingOperations';

UnitTest.test('MergeOperationsTest', () => {
  const b = Structs.bounds;
  const r = Structs.rowcells;
  const re = () => 'row' as unknown as SugarElement<any>;
  const en = (fakeElement: any, isNew: boolean) => Structs.elementnew(fakeElement as SugarElement<any>, isNew, false);

  // Test basic merge.
  (() => {
    const check = (expected: Structs.RowCells[], grid: Structs.RowCells[], bounds: Structs.Bounds, lead: string) => {
      const actual = MergingOperations.merge(grid, bounds, Fun.tripleEquals, Fun.constant(lead as unknown as SugarElement<any>));
      Assert.eq('', expected.length, actual.length);
      Arr.each(expected, (row, i) => {
        Arr.each(row.cells, (cell, j) => {
          Assert.eq('', cell.element, actual[i].cells[j].element);
          Assert.eq('', cell.isNew, actual[i].cells[j].isNew);
        });
        Assert.eq('', row.section, actual[i].section);
      });
    };

    check([], [], b(0, 0, 1, 1), 'a');

    check(
      [ r(re(), [ en('a', false), en('a', false) ], 'thead', false) ],
      [ r(re(), [ en('a', false), en('b', false) ], 'thead', false) ],
      b(0, 0, 0, 1),
      'a'
    );

    check(
      [ r(re(), [ en('a', false), en('a', false) ], 'tbody', false) ],
      [ r(re(), [ en('a', false), en('b', false) ], 'tbody', false) ],
      b(0, 0, 0, 1),
      'a'
    );

    check(
      [
        r(re(), [ en('a', false), en('a', false) ], 'thead', false),
        r(re(), [ en('a', false), en('a', false) ], 'thead', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false) ], 'thead', false),
        r(re(), [ en('c', false), en('d', false) ], 'thead', false)
      ],
      b(0, 0, 1, 1),
      'a'
    );

    check(
      [
        r(re(), [ en('a', false), en('a', false) ], 'tbody', false),
        r(re(), [ en('a', false), en('a', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false) ], 'tbody', false),
        r(re(), [ en('c', false), en('d', false) ], 'tbody', false)
      ],
      b(0, 0, 1, 1),
      'a'
    );

    check(
      [
        r(re(), [ en('a', false), en('a', false), en('c', false) ], 'thead', false),
        r(re(), [ en('d', false), en('e', false), en('f', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false), en('c', false) ], 'thead', false),
        r(re(), [ en('d', false), en('e', false), en('f', false) ], 'tbody', false)
      ], b(0, 0, 0, 1), 'a'
    );

    check(
      [
        r(re(), [ en('a', false), en('a', false), en('c', false) ], 'tbody', false),
        r(re(), [ en('d', false), en('e', false), en('f', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false), en('c', false) ], 'tbody', false),
        r(re(), [ en('d', false), en('e', false), en('f', false) ], 'tbody', false)
      ],
      b(0, 0, 0, 1),
      'a'
    );

    check(
      [
        r(re(), [ en('a', false), en('a', false), en('a', false) ], 'tbody', false),
        r(re(), [ en('a', false), en('a', false), en('a', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false), en('c', false) ], 'tbody', false),
        r(re(), [ en('d', false), en('e', false), en('f', false) ], 'tbody', false)
      ],
      b(0, 0, 1, 2),
      'a'
    );
  })();

  // Test basic unmerge.
  (() => {
    const check = (expected: Structs.RowCells[], grid: Structs.RowCells[], target: string) => {
      const actual = MergingOperations.unmerge(grid, target as unknown as SugarElement<any>, Fun.tripleEquals, Fun.constant('?') as any);
      Assert.eq('', expected.length, actual.length);
      Arr.each(expected, (row, i) => {
        Arr.each(row.cells, (cell, j) => {
          Assert.eq('', cell.element, actual[i].cells[j].element);
          Assert.eq('', cell.isNew, actual[i].cells[j].isNew);
        });
        Assert.eq('section type', row.section, actual[i].section);
        Assert.eq('is new row', row.isNew, actual[i].isNew);
      });
    };

    check([], [], 'a');

    check(
      [ r(re(), [ en('a', false), en('?', true) ], 'thead', false) ],
      [ r(re(), [ en('a', false), en('a', false) ], 'thead', false) ],
      'a'
    );

    check(
      [ r(re(), [ en('a', false), en('?', true) ], 'tbody', false) ],
      [ r(re(), [ en('a', false), en('a', false) ], 'tbody', false) ],
      'a'
    );

    check(
      [
        r(re(), [ en('a', false), en('?', true) ], 'tbody', false),
        r(re(), [ en('?', true), en('?', true) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('a', false) ], 'tbody', false),
        r(re(), [ en('a', false), en('a', false) ], 'tbody', false)
      ],
      'a'
    );

    check(
      [
        r(re(), [ en('a', false), en('b', false), en('?', true), en('c', false) ], 'thead', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false), en('b', false), en('c', false) ], 'thead', false)
      ],
      'b'
    );

    check(
      [
        r(re(), [ en('a', false), en('b', false), en('?', true), en('c', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false), en('b', false), en('c', false) ], 'tbody', false)
      ],
      'b'
    );

    check(
      [
        r(re(), [ en('a', false), en('b', false), en('?', true), en('c', false) ], 'tbody', false),
        r(re(), [ en('a', false), en('?', true), en('?', true), en('d', false) ], 'tbody', false),
        r(re(), [ en('f', false), en('?', true), en('?', true), en('e', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false), en('b', false), en('c', false) ], 'tbody', false),
        r(re(), [ en('a', false), en('b', false), en('b', false), en('d', false) ], 'tbody', false),
        r(re(), [ en('f', false), en('b', false), en('b', false), en('e', false) ], 'tbody', false)
      ],
      'b'
    );

    check(
      [
        r(re(), [ en('a', false), en('b', false), en('b', false), en('c', false) ], 'tbody', false),
        r(re(), [ en('?', true), en('b', false), en('b', false), en('d', false) ], 'tbody', false),
        r(re(), [ en('f', false), en('b', false), en('b', false), en('e', false) ], 'tbody', false)
      ],
      [
        r(re(), [ en('a', false), en('b', false), en('b', false), en('c', false) ], 'tbody', false),
        r(re(), [ en('a', false), en('b', false), en('b', false), en('d', false) ], 'tbody', false),
        r(re(), [ en('f', false), en('b', false), en('b', false), en('e', false) ], 'tbody', false)
      ],
      'a'
    );
  })();
});
