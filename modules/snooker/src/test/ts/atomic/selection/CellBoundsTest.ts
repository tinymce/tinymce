import { Arr } from '@ephox/katamari';
import * as Structs from 'ephox/snooker/api/Structs';
import { Warehouse } from 'ephox/snooker/model/Warehouse';
import CellBounds from 'ephox/snooker/selection/CellBounds';
import { UnitTest, assert } from '@ephox/bedrock-client';
import { Element } from '@ephox/sugar';

UnitTest.test('CellBounds.isWithin Test', function () {
  const s = (fakeEle: any, rowspan: number, colspan: number) => Structs.detail(fakeEle as any as Element, rowspan, colspan);
  const f = (fakeEle: any, cells: Structs.Detail[], section: 'tbody') => Structs.rowdata(fakeEle as any as Element, cells, section);

  const testTableA = [
    f('r1', [ s('a', 1, 1), s('b', 1, 1), s('c', 1, 1), s('d', 1, 1), s('e', 1, 1) ], 'tbody'),
    f('r2', [ s('f', 1, 1), s('g', 1, 1), s('h', 1, 2), s('i', 1, 1) ], 'tbody'),
    f('r3', [ s('l', 1, 1), s('m', 1, 1), s('n', 1, 3)], 'tbody'),
    f('r4', [ s('o', 1, 1), s('p', 1, 1), s('q', 1, 2), s('r', 1, 1) ], 'tbody'),
    f('r5', [ s('s', 1, 1), s('t', 1, 1), s('u', 1, 1), s('v', 1, 1), s('z', 1, 1)], 'tbody')
  ];
  const inputA = Warehouse.generate(testTableA);

  const bounds1To3 = Structs.bounds(1, 1, 3, 3);

  const checkWithin = function (expected: boolean, warehouse: Warehouse, bounds: Structs.Bounds, row: number, column: number) {
    const cell = Warehouse.getAt(warehouse, row, column).getOrDie();
    const actual = CellBounds.isWithin(bounds, cell);
    assert.eq(expected, actual);
  };

  const checkInSelection = function (expected: boolean, warehouse: Warehouse, bounds: Structs.Bounds, row: number, column: number) {
    const cell = Warehouse.getAt(warehouse, row, column).getOrDie();
    const actual = CellBounds.inSelection(bounds, cell);
    assert.eq(expected, actual);
  };

  checkWithin(false, inputA, bounds1To3, 2, 2);
  checkWithin(true, inputA, bounds1To3, 3, 3);
  checkWithin(false, inputA, bounds1To3, 0, 0);
  checkWithin(true, inputA, bounds1To3, 3, 1);

  // 'element', 'rowspan', 'colspan'
  const testTableB = [
    f('r1', [ s('a', 3, 1), s('b', 1, 1), s('c', 1, 1), s('d', 2, 1) ], 'tbody'),
    f('r2', [ s('e', 2, 2) ], 'tbody'),
    f('r3', [ s('f', 2, 1) ], 'tbody'),
    f('r4', [ s('g', 1, 3) ], 'tbody')
  ];
  const inputB = Warehouse.generate(testTableB);

  const bounds0To2 = Structs.bounds(0, 0, 2, 2);

  checkWithin(false, inputB, bounds0To2, 3, 0);
  checkWithin(true, inputB, bounds0To2, 0, 1);
  checkWithin(true, inputB, bounds0To2, 1, 1);
  checkWithin(true, inputB, bounds0To2, 2, 2);
  checkWithin(false, inputB, bounds0To2, 1, 3);

  const testTableC = [
    f('r1', [ s('a', 1, 1), s('b', 1, 3), s('c', 1, 1) ], 'tbody'),
    f('r2', [ s('d', 3, 1), s('e', 1, 1), s('f', 1, 1), s('g', 1, 2) ], 'tbody'),
    f('r3', [ s('h', 1, 3), s('i', 2, 1) ], 'tbody'),
    f('r4', [ s('j', 1, 2), s('k', 1, 1) ], 'tbody'),
    f('r5', [ s('l', 1, 1), s('m', 1, 1), s('n', 1, 1), s('o', 1, 1), s('p', 1, 1) ], 'tbody')
  ];
  const inputC = Warehouse.generate(testTableC);
  const boundsC = Structs.bounds(1, 2, 4, 2 );

  const cases = [
    { expected: false, label: 'a', row: 0, column: 0 },
    { expected: false, label: 'b', row: 0, column: 1 },
    { expected: false, label: 'c', row: 0, column: 4 },

    { expected: false, label: 'd', row: 1, column: 0 },
    { expected: false, label: 'e', row: 1, column: 1 },
    { expected: true, label: 'f', row: 1, column: 2 },
    { expected: false, label: 'g', row: 1, column: 3 },

    { expected: true, label: 'h', row: 2, column: 1 },
    { expected: false, label: 'i', row: 2, column: 4 },

    { expected: true, label: 'j', row: 3, column: 1 },
    { expected: false, label: 'k', row: 3, column: 3 },

    { expected: false, label: 'l', row: 4, column: 0 },
    { expected: false, label: 'm', row: 4, column: 1 },
    { expected: true, label: 'n', row: 4, column: 2 },
    { expected: false, label: 'o', row: 4, column: 3 },
    { expected: false, label: 'p', row: 4, column: 4 },
  ];

  Arr.each(cases, function (c) {
    checkInSelection(c.expected, inputC, boundsC, c.row, c.column);
  });
});
