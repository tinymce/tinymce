import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import * as Structs from 'ephox/snooker/api/Structs';
import * as MergingOperations from 'ephox/snooker/operate/MergingOperations';

UnitTest.test('MergeOperationsTest', function () {
  const b = Structs.bounds;
  const r = Structs.rowcells;
  const en = (fakeElement: any, isNew: boolean) => Structs.elementnew(fakeElement as Element, isNew);

  // Test basic merge.
  (function () {
    const check = function (expected: Structs.RowCells[], grid: Structs.RowCells[], bounds: Structs.Bounds, lead: string) {
      const actual = MergingOperations.merge(grid, bounds, Fun.tripleEquals, Fun.constant(lead as unknown as Element));
      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (row, i) {
        Arr.each(row.cells(), function (cell, j) {
          assert.eq(cell.element(), actual[i].cells()[j].element());
          assert.eq(cell.isNew(), actual[i].cells()[j].isNew());
        });
        assert.eq(row.section(), actual[i].section());
      });
    };

    check([], [], b(0, 0, 1, 1), 'a');
    check([ r([ en('a', false), en('a', false) ], 'thead') ], [ r([ en('a', false), en('b', false) ], 'thead') ], b(0, 0, 0, 1), 'a');
    check([ r([ en('a', false), en('a', false) ], 'tbody') ], [ r([ en('a', false), en('b', false) ], 'tbody') ], b(0, 0, 0, 1), 'a');
    check(
      [
        r([ en('a', false), en('a', false) ], 'thead'),
        r([ en('a', false), en('a', false) ], 'thead')
      ],
      [
        r([ en('a', false), en('b', false) ], 'thead'),
        r([ en('c', false), en('d', false) ], 'thead')
      ], b(0, 0, 1, 1), 'a'
    );
    check(
      [
        r([ en('a', false), en('a', false) ], 'tbody'),
        r([ en('a', false), en('a', false) ], 'tbody')
      ],
      [
        r([ en('a', false), en('b', false) ], 'tbody'),
        r([ en('c', false), en('d', false) ], 'tbody')
      ], b(0, 0, 1, 1), 'a'
    );

    check(
      [
        r([ en('a', false), en('a', false), en('c', false) ], 'thead'),
        r([ en('d', false), en('e', false), en('f', false) ], 'tbody')
      ],
      [
        r([ en('a', false), en('b', false), en('c', false) ], 'thead'),
        r([ en('d', false), en('e', false), en('f', false) ], 'tbody')
      ], b(0, 0, 0, 1), 'a'
    );
    check(
      [
        r([ en('a', false), en('a', false), en('c', false) ], 'tbody'),
        r([ en('d', false), en('e', false), en('f', false) ], 'tbody')
      ],
      [
        r([ en('a', false), en('b', false), en('c', false) ], 'tbody'),
        r([ en('d', false), en('e', false), en('f', false) ], 'tbody')
      ], b(0, 0, 0, 1), 'a'
    );

    check(
      [
        r([ en('a', false), en('a', false), en('a', false) ], 'tbody'),
        r([ en('a', false), en('a', false), en('a', false) ], 'tbody')
      ],
      [
        r([ en('a', false), en('b', false), en('c', false) ], 'tbody'),
        r([ en('d', false), en('e', false), en('f', false) ], 'tbody')
      ], b(0, 0, 1, 2), 'a'
    );
  })();

  // Test basic unmerge.
  (function () {
    const check = function (expected: Structs.RowCells[], grid: Structs.RowCells[], target: string) {
      const actual = MergingOperations.unmerge(grid, target as unknown as Element, Fun.tripleEquals, Fun.constant('?') as any);
      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (row, i) {
        Arr.each(row.cells(), function (cell, j) {
          assert.eq(cell.element(), actual[i].cells()[j].element());
          assert.eq(cell.isNew(), actual[i].cells()[j].isNew());
        });
        assert.eq(row.section(), actual[i].section());
      });
    };

    check([], [], 'a');
    check([ r([ en('a', false), en('?', true) ], 'thead') ], [ r([ en('a', false), en('a', false) ], 'thead') ], 'a');
    check([ r([ en('a', false), en('?', true) ], 'tbody') ], [ r([ en('a', false), en('a', false) ], 'tbody') ], 'a');
    check(
      [
        r([ en('a', false), en('?', true) ], 'tbody'),
        r([ en('?', true), en('?', true) ], 'tbody')
      ],
      [
        r([ en('a', false), en('a', false) ], 'tbody'),
        r([ en('a', false), en('a', false) ], 'tbody')
      ], 'a'
    );

    check(
      [
        r([ en('a', false), en('b', false), en('?', true), en('c', false) ], 'thead')
      ],
      [
        r([ en('a', false), en('b', false), en('b', false), en('c', false) ], 'thead')
      ], 'b'
    );
    check(
      [
        r([ en('a', false), en('b', false), en('?', true), en('c', false) ], 'tbody')
      ],
      [
        r([ en('a', false), en('b', false), en('b', false), en('c', false) ], 'tbody')
      ], 'b'
    );

    check(
      [
        r([ en('a', false), en('b', false), en('?', true), en('c', false) ], 'tbody'),
        r([ en('a', false), en('?', true), en('?', true), en('d', false) ], 'tbody'),
        r([ en('f', false), en('?', true), en('?', true), en('e', false) ], 'tbody')
      ],
      [
        r([ en('a', false), en('b', false), en('b', false), en('c', false) ], 'tbody'),
        r([ en('a', false), en('b', false), en('b', false), en('d', false) ], 'tbody'),
        r([ en('f', false), en('b', false), en('b', false), en('e', false) ], 'tbody')
      ], 'b'
    );

    check(
      [
        r([ en('a', false), en('b', false), en('b', false), en('c', false) ], 'tbody'),
        r([ en('?', true), en('b', false), en('b', false), en('d', false) ], 'tbody'),
        r([ en('f', false), en('b', false), en('b', false), en('e', false) ], 'tbody')
      ],
      [
        r([ en('a', false), en('b', false), en('b', false), en('c', false) ], 'tbody'),
        r([ en('a', false), en('b', false), en('b', false), en('d', false) ], 'tbody'),
        r([ en('f', false), en('b', false), en('b', false), en('e', false) ], 'tbody')
      ], 'a'
    );
  })();
});
