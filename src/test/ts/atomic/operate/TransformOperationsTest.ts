import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import Generators from 'ephox/snooker/api/Generators';
import Structs from 'ephox/snooker/api/Structs';
import TransformOperations from 'ephox/snooker/operate/TransformOperations';
import TestGenerator from 'ephox/snooker/test/TestGenerator';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('TransformOperationsTest', function () {
  var en = Structs.elementnew;

  var mapToStructGrid = function (grid) {
    return Arr.map(grid, function (row) {
      return Structs.rowcells(row, 'tbody');
    });
  };

  var assertGrids = function (expected, actual) {
    assert.eq(expected.length, actual.length);
    Arr.each(expected, function (row, i) {
      Arr.each(row.cells(), function (cell, j) {
        assert.eq(cell.element(), actual[i].cells()[j].element());
        assert.eq(cell.isNew(), actual[i].cells()[j].isNew());
      });
      assert.eq(row.section(), actual[i].section());
    });
  };

  // Test basic changing to header (column)
  (function () {
    var check = function (expected, grid, index) {
      var structExpected = mapToStructGrid(expected);
      var structGrid = mapToStructGrid(grid);
      var actual = TransformOperations.replaceColumn(structGrid, index, Fun.tripleEquals, Generators.transform('scope', 'tag')(TestGenerator()).replaceOrInit);
      assertGrids(structExpected, actual);
    };

    check([
      [en('h(a)_0', true)]
    ], [
        [en('a', false)]
      ], 0);

    check([
      [en('a', false), en('a', false), en('a', false)],
      [en('b', false), en('h(c)_0', true), en('d', false)],
      [en('e', false), en('h(f)_1', true), en('h(f)_1', true)]
    ], [
        [en('a', false), en('a', false), en('a', false)],
        [en('b', false), en('c', false), en('d', false)],
        [en('e', false), en('f', false), en('f', false)]
      ], 1);

    check([
      [en('a', false), en('a', false), en('a', false)],
      [en('b', false), en('h(c)_0', true), en('d', false)],
      [en('f', false), en('f', false), en('f', false)]
    ], [
        [en('a', false), en('a', false), en('a', false)],
        [en('b', false), en('c', false), en('d', false)],
        [en('f', false), en('f', false), en('f', false)]
      ], 1);

    check([
      [en('h(a)_0', true), en('h(a)_0', true), en('h(a)_0', true)],
      [en('h(b)_1', true), en('c', false), en('d', false)],
      [en('h(f)_2', true), en('h(f)_2', true), en('h(f)_2', true)]
    ], [
        [en('a', false), en('a', false), en('a', false)],
        [en('b', false), en('c', false), en('d', false)],
        [en('f', false), en('f', false), en('f', false)]
      ], 0);

    check([
      [en('h(a)_0', true), en('h(a)_0', true), en('h(a)_0', true)],
      [en('h(a)_0', true), en('h(a)_0', true), en('h(a)_0', true)],
      [en('h(b)_1', true), en('c', false), en('d', false)],
      [en('h(f)_2', true), en('h(f)_2', true), en('h(f)_2', true)]
    ], [
        [en('a', false), en('a', false), en('a', false)],
        [en('a', false), en('a', false), en('a', false)],
        [en('b', false), en('c', false), en('d', false)],
        [en('f', false), en('f', false), en('f', false)]
      ], 0);
  })();

  // Test basic changing to header (row)
  (function () {
    var check = function (expected, grid, index) {
      var structExpected = mapToStructGrid(expected);
      var structGrid = mapToStructGrid(grid);
      var actual = TransformOperations.replaceRow(structGrid, index, Fun.tripleEquals, Generators.transform('scope', 'tag')(TestGenerator()).replaceOrInit);
      assertGrids(structExpected, actual);
    };

    check([[]], [[]], 0);
    check([
      [en('h(a)_0', true)]
    ], [
        [en('a', false)]
      ], 0);

    check([
      [en('a', false), en('b', false), en('e', false)],
      [en('a', false), en('h(c)_0', true), en('h(f)_1', true)],
      [en('a', false), en('d', false), en('h(f)_1', true)]
    ], [
        [en('a', false), en('b', false), en('e', false)],
        [en('a', false), en('c', false), en('f', false)],
        [en('a', false), en('d', false), en('f', false)]
      ], 1);

    check([
      [en('a', false), en('b', false), en('f', false)],
      [en('a', false), en('h(c)_0', true), en('f', false)],
      [en('a', false), en('d', false), en('f', false)]
    ], [
        [en('a', false), en('b', false), en('f', false)],
        [en('a', false), en('c', false), en('f', false)],
        [en('a', false), en('d', false), en('f', false)]
      ], 1);

    check([
      [en('h(a)_0', true), en('h(b)_1', true), en('h(f)_2', true)],
      [en('h(a)_0', true), en('c', false), en('h(f)_2', true)],
      [en('h(a)_0', true), en('d', false), en('h(f)_2', true)]
    ], [
        [en('a', false), en('b', false), en('f', false)],
        [en('a', false), en('c', false), en('f', false)],
        [en('a', false), en('d', false), en('f', false)]
      ], 0);

    check([
      [en('h(a)_0', true), en('h(a)_0', true), en('h(b)_1', true), en('h(f)_2', true)],
      [en('h(a)_0', true), en('h(a)_0', true), en('c', false), en('h(f)_2', true)],
      [en('h(a)_0', true), en('h(a)_0', true), en('d', false), en('h(f)_2', true)]
    ], [
        [en('a', false), en('a', false), en('b', false), en('f', false)],
        [en('a', false), en('a', false), en('c', false), en('f', false)],
        [en('a', false), en('a', false), en('d', false), en('f', false)]
      ], 0);
  })();
});

