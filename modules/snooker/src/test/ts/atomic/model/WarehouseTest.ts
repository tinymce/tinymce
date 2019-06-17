import { Obj } from '@ephox/katamari';
import * as Structs from 'ephox/snooker/api/Structs';
import { Warehouse } from 'ephox/snooker/model/Warehouse';
import { UnitTest, assert } from '@ephox/bedrock';
import { Element } from '@ephox/sugar';

UnitTest.test('WarehouseTest', function () {
  const check = function (expected: Record<string, string>, input: Structs.RowData<Structs.Detail>[]) {
    const actual = Warehouse.generate(input);
    assert.eq(expected, Obj.map(actual.access(), function (x) { return x.element(); }));
  };

  const s = (fakeEle: any, rowspan: number, colspan: number) => Structs.detail(fakeEle as any as Element, rowspan, colspan);
  const f = (fakeEle: any, cells: Structs.Detail[], section: 'tbody' | 'thead' | 'tfoot') => Structs.rowdata(fakeEle as any as Element, cells, section);

  const testTable = [
    f('r1', [ s('a', 1, 2), s('b', 1, 1), s('c', 1, 1), s('d', 1, 1), s('e', 1, 1), s('f', 1, 1) ], 'thead'),
    f('r2', [ s('g', 1, 1), s('h', 1, 1), s('i', 1, 1), s('j', 1, 1), s('k', 1, 3) ], 'tbody'),
    f('f3', [ s('l', 1, 1), s('m', 3, 2), s('n', 1, 1), s('o', 1, 1), s('p', 1, 1), s('q', 1, 1) ], 'tfoot'),
    f('f4', [ s('r', 2, 1), s('s', 1, 1), s('t', 2, 1), s('u', 1, 1), s('v', 1, 1) ], 'tfoot'),
    f('r5', [ s('w', 1, 1), s('x', 1, 1), s('y', 1, 1) ], 'tfoot')
  ];

  check({
    '0,0': 'a',
    '0,1': 'a',
    '0,2': 'b',
    '0,3': 'c',
    '0,4': 'd',
    '0,5': 'e',
    '0,6': 'f',
    '1,0': 'g',
    '1,1': 'h',
    '1,2': 'i',
    '1,3': 'j',
    '1,4': 'k',
    '1,5': 'k',
    '1,6': 'k',
    '2,0': 'l',
    '2,1': 'm',
    '2,2': 'm',
    '2,3': 'n',
    '2,4': 'o',
    '2,5': 'p',
    '2,6': 'q',
    '3,0': 'r',
    '3,1': 'm',
    '3,2': 'm',
    '3,3': 's',
    '3,4': 't',
    '3,5': 'u',
    '3,6': 'v',
    '4,0': 'r',
    '4,1': 'm',
    '4,2': 'm',
    '4,3': 'w',
    '4,4': 't',
    '4,5': 'x',
    '4,6': 'y'
  }, testTable);

  check({
    '0,0': 'a',
    '0,1': 'a',
    '0,2': 'a'
  },
    [
      f('r0', [ s('a', 1, 3) ], 'tbody')
    ]
  );
});
