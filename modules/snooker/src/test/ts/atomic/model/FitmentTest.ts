import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Structs from 'ephox/snooker/api/Structs';
import * as Fitment from 'ephox/snooker/test/Fitment';
import * as TableMerge from 'ephox/snooker/test/TableMerge';
import TestGenerator from 'ephox/snooker/test/TestGenerator';

UnitTest.test('FitmentTest', () => {
  const generator = TestGenerator;
  const start = Structs.address;
  const measureTest = Fitment.measureTest;
  const tailorTest = Fitment.tailorTest;
  const mergeGridsTest = TableMerge.mergeTest;

  const en = (fakeElement: any, isNew: boolean) => Structs.elementnew(fakeElement as SugarElement<any>, isNew, false);

  const check = <T extends (...args: A) => void, A extends any[]>(test: T, ...args: A) => {
    test.apply(null, args);
  };

  // Simple test data, 4 basic variants of merging:
  // gridB into gridA with different start points
  const gridA = () => [
    [ en('a', false), en('b', false), en('c', false) ],
    [ en('d', false), en('e', false), en('f', false) ],
    [ en('g', false), en('h', false), en('i', false) ]
  ];

  const gridB = () => [
    [ en(1, true), en(2, true) ],
    [ en(3, true), en(4, true) ]
  ];

  // col and row are + meaning gridB fits into gridA, given the starting selection point 'a'
  check(measureTest, {
    rowDelta: 1,
    colDelta: 1
  }, start(0, 0), gridA(), gridB(), Fun.noop, Fun.noop);

  // col and row are > -1 meaning gridB fits into gridA, given the starting selection point 'e'
  check(measureTest, {
    rowDelta: 0,
    colDelta: 0
  }, start(1, 1), gridA(), gridB(), Fun.noop, Fun.noop);

  // row is 1 too short col is 1 too short, given the starting selection point 'i'
  check(measureTest, {
    rowDelta: -1,
    colDelta: -1
  }, start(2, 2), gridA(), gridB(), Fun.noop, Fun.noop);

  // col is 1 too short, given the starting selection point 'c' (need to add another column)
  check(measureTest, {
    rowDelta: 1,
    colDelta: -1
  }, start(0, 2), gridA(), gridB(), Fun.noop, Fun.noop);

  // the starting position is invalid, it should break expect an error
  check(measureTest, {
    error: 'invalid start address out of table bounds, row: 10, column: 66'
  }, start(10, 66), gridA(), gridB(), Fun.noop, Fun.noop);

  check(
    tailorTest,
    [
      [ en('a', false), en('b', false), en('c', false) ],
      [ en('d', false), en('e', false), en('f', false) ],
      [ en('g', false), en('h', false), en('i', false) ]
    ], start(0, 0), gridA(), {
      rowDelta: 1,
      colDelta: 1
    }, generator, Fun.noop);

  check(
    tailorTest,
    [
      [ en('a', false), en('b', false), en('c', false) ],
      [ en('d', false), en('e', false), en('f', false) ],
      [ en('g', false), en('h', false), en('i', false) ]
    ], start(1, 1), gridA(), {
      rowDelta: 0,
      colDelta: 0
    }, generator, Fun.noop);

  check(
    tailorTest,
    [
      [ en('a', false), en('b', false), en('c', false), en('?_0', true) ],
      [ en('d', false), en('e', false), en('f', false), en('?_1', true) ],
      [ en('g', false), en('h', false), en('i', false), en('?_2', true) ],
      [ en('?_3', true), en('?_4', true), en('?_5', true), en('?_6', true) ]
    ], start(2, 2), gridA(), {
      rowDelta: -1,
      colDelta: -1
    }, generator, Fun.noop);

  check(
    tailorTest,
    [
      [ en('a', false), en('b', false), en('c', false), en('?_0', true) ],
      [ en('d', false), en('e', false), en('f', false), en('?_1', true) ],
      [ en('g', false), en('h', false), en('i', false), en('?_2', true) ]
    ], start(0, 2), gridA(), {
      rowDelta: 1,
      colDelta: -1
    }, generator, Fun.noop);

  check(
    mergeGridsTest,
    [
      [ en('h(1)_0', true), en('h(2)_1', true), en('c', false) ],
      [ en('h(3)_2', true), en('h(4)_3', true), en('f', false) ],
      [ en('g', false), en('h', false), en('i', false) ]
    ], start(0, 0), gridA(), gridB(), generator, Fun.tripleEquals);

  check(
    mergeGridsTest,
    [
      [ en('a', false), en('b', false), en('c', false) ],
      [ en('d', false), en('h(1)_0', true), en('h(2)_1', true) ],
      [ en('g', false), en('h(3)_2', true), en('h(4)_3', true) ]
    ], start(1, 1), gridA(), gridB(), generator, Fun.tripleEquals);

  check(
    mergeGridsTest,
    [
      [ en('a', false), en('b', false), en('c', false), en('?_0', true) ],
      [ en('d', false), en('e', false), en('f', false), en('?_1', true) ],
      [ en('g', false), en('h', false), en('h(1)_0', true), en('h(2)_1', true) ],
      [ en('?_3', true), en('?_4', true), en('h(3)_2', true), en('h(4)_3', true) ]
    ], start(2, 2), gridA(), gridB(), generator, Fun.tripleEquals);

  check(
    mergeGridsTest,
    [
      [ en('a', false), en('b', false), en('h(1)_0', true), en('h(2)_1', true) ],
      [ en('d', false), en('e', false), en('h(3)_2', true), en('h(4)_3', true) ],
      [ en('g', false), en('h', false), en('i', false), en('?_2', true) ]
    ], start(0, 2), gridA(), gridB(), generator, Fun.tripleEquals);

  check(
    mergeGridsTest, {
      error: 'invalid start address out of table bounds, row: 8, column: 1'
    }, start(8, 1), gridA(), gridB(), generator, Fun.tripleEquals);
});
