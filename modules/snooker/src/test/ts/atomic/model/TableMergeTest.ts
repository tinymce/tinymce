import { Fun } from '@ephox/katamari';
import * as Structs from 'ephox/snooker/api/Structs';
import TableMerge from 'ephox/snooker/test/TableMerge';
import TestGenerator from 'ephox/snooker/test/TestGenerator';
import { UnitTest } from '@ephox/bedrock';
import { Element } from '@ephox/sugar';

UnitTest.test('TableMergeTest', function () {
  const generator = TestGenerator;
  const start = Structs.address;
  const suite = TableMerge.suite;

  const en = (fakeElement: any, isNew: boolean) => Structs.elementnew(fakeElement as any as Element, isNew);

  // Advanced Spans
  const gridAdvancedOne = function () {
    return [
      [ en('A', false), en('B', false), en('B', false), en('C', false) ],
      [ en('D', false), en('B', false), en('B', false), en('E', false) ],
      [ en('F', false), en('F', false), en('F', false), en('E', false) ],
      [ en('F', false), en('F', false), en('F', false), en('G', false) ],
      [ en('F', false), en('F', false), en('F', false), en('H', false) ],
      [ en('I', false), en('J', false), en('K', false), en('K', false) ],
      [ en('I', false), en('L', false), en('L', false), en('M', false) ]
    ];
  };

  const gridSpanB = function () {
    return [
      [ en('alpha', true), en('alpha', true) ],
      [ en('beta', true),  en('charlie', true) ]
    ];
  };

  // These are suites which combine all 3 tests in 1 spec (measure, tailor, merge)
  // merge gridBee into gridAphid
  const gridAphid = function () {
    return [
      [ en('a', false), en('b', false), en('c', false) ],
      [ en('d', false), en('e', false), en('f', false) ],
      [ en('g', false), en('h', false), en('i', false) ],
      [ en('j', false), en('k', false), en('l', false) ]
    ];
  };

  const gridBee = function () {
    return [
      [ en('bee1', true) ],
      [ en('bee2', true) ],
      [ en('bee3', true) ],
      [ en('bee3', true) ],
      [ en('bee3', true) ]
    ];
  };

  const gridcicada = function () {
    return [
      [ en('cic1', true), en('cic2', true), en('cic3', true), en('cic3', true), en('cic3', true), en('cic4', true), en('cic4', true), en('cic4', true)]
    ];
  };

  suite(
    'insert at "j" a long table',
    start(3, 0), gridAphid, gridBee, generator, Fun.tripleEquals,
    {
      rowDelta: -4,
      colDelta: 2
    },
    [
      [en('a', false), en('b', false), en('c', false)],
      [en('d', false), en('e', false), en('f', false)],
      [en('g', false), en('h', false), en('i', false)],
      [en('j', false), en('k', false), en('l', false)],
      [en('?_0', true), en('?_1', true), en('?_2', true)],
      [en('?_3', true), en('?_4', true), en('?_5', true)],
      [en('?_6', true), en('?_7', true), en('?_8', true)],
      [en('?_9', true), en('?_10', true), en('?_11', true)]
    ],
    [
      [en('a', false),          en('b', false),   en('c', false)],
      [en('d', false),          en('e', false),   en('f', false)],
      [en('g', false),          en('h', false),   en('i', false)],
      [en('h(bee1)_0', true), en('k', false),   en('l', false)],
      [en('h(bee2)_1', true), en('?_1', true), en('?_2', true)],
      [en('h(bee3)_2', true), en('?_4', true), en('?_5', true)],
      [en('h(bee3)_3', true), en('?_7', true), en('?_8', true)],
      [en('h(bee3)_4', true), en('?_10', true), en('?_11', true)]
    ]
  );

  suite(
    'insert at "d" a wide table',
    start(1, 0), gridAphid, gridcicada, generator, Fun.tripleEquals,
    {
      rowDelta: 2,
      colDelta: -5
    },
    [
      [en('a', false), en('b', false), en('c', false), en('?_0', true),  en('?_1', true),  en('?_2', true),  en('?_3', true),  en('?_4', true)],
      [en('d', false), en('e', false), en('f', false), en('?_5', true),  en('?_6', true),  en('?_7', true),  en('?_8', true),  en('?_9', true)],
      [en('g', false), en('h', false), en('i', false), en('?_10', true), en('?_11', true), en('?_12', true), en('?_13', true), en('?_14', true)],
      [en('j', false), en('k', false), en('l', false), en('?_15', true), en('?_16', true), en('?_17', true), en('?_18', true), en('?_19', true)]
    ],
    [
      [en('a', false), en('b', false), en('c', false), en('?_0', true),  en('?_1', true),  en('?_2', true),  en('?_3', true),  en('?_4', true)],
      [en('h(cic1)_0', true), en('h(cic2)_1', true), en('h(cic3)_2', true), en('h(cic3)_3', true), en('h(cic3)_4', true), en('h(cic4)_5', true),  en('h(cic4)_6', true), en('h(cic4)_7', true)],
      [en('g', false), en('h', false), en('i', false), en('?_10', true), en('?_11', true), en('?_12', true), en('?_13', true), en('?_14', true)],
      [en('j', false), en('k', false), en('l', false), en('?_15', true), en('?_16', true), en('?_17', true), en('?_18', true), en('?_19', true)]
    ]
  );

  suite(
    'Unmerging spans - Merge gridSpanB, into gridAdvancedOne, at "D" on gridAdvancedOne',
    start(1, 0), gridAdvancedOne, gridSpanB, generator, Fun.tripleEquals,
    {
      rowDelta: 4,
      colDelta: 2
    },
    [
      [ en('A', false), en('B', false), en('B', false), en('C', false) ],
      [ en('D', false), en('B', false), en('B', false), en('E', false) ],
      [ en('F', false), en('F', false), en('F', false), en('E', false) ],
      [ en('F', false), en('F', false), en('F', false), en('G', false) ],
      [ en('F', false), en('F', false), en('F', false), en('H', false) ],
      [ en('I', false), en('J', false), en('K', false), en('K', false) ],
      [ en('I', false), en('L', false), en('L', false), en('M', false) ]
    ],
    [
      [ en('A', false), en('B', false), en('?_0', true), en('C', false) ],
      [ en('h(alpha)_0', true), en('h(alpha)_1', true), en('?_2', true), en('E', false) ],
      [ en('h(beta)_2', true), en('h(charlie)_3', true), en('?_4', true), en('E', false) ],
      [ en('?_5', true), en('?_6', true), en('?_7', true), en('G', false) ],
      [ en('?_8', true), en('?_9', true), en('?_10', true), en('H', false) ],
      [ en('I', false), en('J', false), en('K', false), en('K', false) ],
      [ en('I', false), en('L', false), en('L', false), en('M', false) ]
    ]
  );

  suite(
    'Unmerging spans - Merge gridSpanB, into gridAdvancedOne, at "M" on gridAdvancedOne',
    start(6, 3), gridAdvancedOne, gridSpanB, generator, Fun.tripleEquals,
    {
      rowDelta: -1,
      colDelta: -1
    },
    [
      [ en('A', false), en('B', false), en('B', false), en('C', false), en('?_0', true) ],
      [ en('D', false), en('B', false), en('B', false), en('E', false), en('?_1', true) ],
      [ en('F', false), en('F', false), en('F', false), en('E', false), en('?_2', true) ],
      [ en('F', false), en('F', false), en('F', false), en('G', false), en('?_3', true) ],
      [ en('F', false), en('F', false), en('F', false), en('H', false), en('?_4', true) ],
      [ en('I', false), en('J', false), en('K', false), en('K', false), en('?_5', true) ],
      [ en('I', false), en('L', false), en('L', false), en('M', false), en('?_6', true) ],
      [ en('?_7', true), en('?_8', true), en('?_9', true), en('?_10', true), en('?_11', true) ]
    ],
    [
      [ en('A', false), en('B', false), en('B', false), en('C', false), en('?_0', true) ],
      [ en('D', false), en('B', false), en('B', false), en('E', false), en('?_1', true) ],
      [ en('F', false), en('F', false), en('F', false), en('E', false), en('?_2', true) ],
      [ en('F', false), en('F', false), en('F', false), en('G', false), en('?_3', true) ],
      [ en('F', false), en('F', false), en('F', false), en('H', false), en('?_4', true) ],
      [ en('I', false), en('J', false), en('K', false), en('K', false), en('?_5', true) ],
      [ en('I', false), en('L', false), en('L', false), en('h(alpha)_0', true), en('h(alpha)_1', true) ],
      [ en('?_7', true), en('?_8', true), en('?_9', true), en('h(beta)_2', true), en('h(charlie)_3', true) ]
    ]
  );

  suite(
    'Unmerging spans - Merge gridSpanB, into gridAdvancedOne, at bottom right "B" on gridAdvancedOne',
    start(1, 2), gridAdvancedOne, gridSpanB, generator, Fun.tripleEquals,
    {
      rowDelta: 4,
      colDelta: 0
    },
    [
      [ en('A', false), en('B', false), en('B', false), en('C', false) ],
      [ en('D', false), en('B', false), en('B', false), en('E', false) ],
      [ en('F', false), en('F', false), en('F', false), en('E', false) ],
      [ en('F', false), en('F', false), en('F', false), en('G', false) ],
      [ en('F', false), en('F', false), en('F', false), en('H', false) ],
      [ en('I', false), en('J', false), en('K', false), en('K', false) ],
      [ en('I', false), en('L', false), en('L', false), en('M', false) ]
    ],
    [
      [ en('A', false), en('B', false), en('?_0', true), en('C', false) ],
      [ en('D', false), en('?_1', true), en('h(alpha)_0', true), en('h(alpha)_1', true) ],
      [ en('F', false), en('?_4', true), en('h(beta)_2', true), en('h(charlie)_3', true) ],
      [ en('?_6', true), en('?_7', true), en('?_8', true), en('G', false) ],
      [ en('?_9', true), en('?_10', true), en('?_11', true), en('H', false) ],
      [ en('I', false), en('J', false), en('K', false), en('K', false) ],
      [ en('I', false), en('L', false), en('L', false), en('M', false) ]
    ]
  );

  suite(
    'Unmerging spans - Merge gridBee, into gridAdvancedOne, at bottom left "F" on gridAdvancedOne',
    start(4, 0), gridAdvancedOne, gridBee, generator, Fun.tripleEquals,
    {
      rowDelta: -2,
      colDelta: 3
    },
    [
      [ en('A', false), en('B', false), en('B', false), en('C', false) ],
      [ en('D', false), en('B', false), en('B', false), en('E', false) ],
      [ en('F', false), en('F', false), en('F', false), en('E', false) ],
      [ en('F', false), en('F', false), en('F', false), en('G', false) ],
      [ en('F', false), en('F', false), en('F', false), en('H', false) ],
      [ en('I', false), en('J', false), en('K', false), en('K', false) ],
      [ en('I', false), en('L', false), en('L', false), en('M', false) ],
      [ en('?_0', true), en('?_1', true), en('?_2', true), en('?_3', true) ],
      [ en('?_4', true), en('?_5', true), en('?_6', true), en('?_7', true) ]
    ],
    [
      [ en('A', false),         en('B', false),    en('B', false),   en('C', false) ],
      [ en('D', false),         en('B', false),    en('B', false),   en('E', false) ],
      [ en('F', false),         en('?_8', true),  en('?_9', true), en('E', false) ],
      [ en('?_10', true),      en('?_11', true), en('?_12', true), en('G', false) ],
      [ en('h(bee1)_0', true), en('?_14', true), en('?_15', true), en('H', false) ],
      [ en('h(bee2)_1', true), en('J', false),    en('K', false),   en('K', false) ],
      [ en('h(bee3)_2', true), en('L', false),    en('L', false),   en('M', false) ],
      [ en('h(bee3)_3', true), en('?_1', true),  en('?_2', true), en('?_3', true) ],
      [ en('h(bee3)_4', true), en('?_5', true),  en('?_6', true), en('?_7', true) ]
    ]
  );

  suite(
    'Unmerging spans - Merge gridcicada, into gridAdvancedOne, at bottom left "I" on gridAdvancedOne',
    start(6, 0), gridAdvancedOne, gridcicada, generator, Fun.tripleEquals,
    {
      rowDelta: 0,
      colDelta: -4
    },
    [
      [ en('A', false), en('B', false), en('B', false), en('C', false), en('?_0', true),  en('?_1', true),  en('?_2', true),  en('?_3', true) ],
      [ en('D', false), en('B', false), en('B', false), en('E', false), en('?_4', true),  en('?_5', true),  en('?_6', true),  en('?_7', true) ],
      [ en('F', false), en('F', false), en('F', false), en('E', false), en('?_8', true),  en('?_9', true),  en('?_10', true), en('?_11', true) ],
      [ en('F', false), en('F', false), en('F', false), en('G', false), en('?_12', true), en('?_13', true), en('?_14', true), en('?_15', true) ],
      [ en('F', false), en('F', false), en('F', false), en('H', false), en('?_16', true), en('?_17', true), en('?_18', true),  en('?_19', true) ],
      [ en('I', false), en('J', false), en('K', false), en('K', false), en('?_20', true), en('?_21', true), en('?_22', true),  en('?_23', true) ],
      [ en('I', false), en('L', false), en('L', false), en('M', false), en('?_24', true), en('?_25', true), en('?_26', true),  en('?_27', true) ]
    ],
    [
      [ en('A', false), en('B', false), en('B', false), en('C', false), en('?_0', true),  en('?_1', true),  en('?_2', true),  en('?_3', true) ],
      [ en('D', false), en('B', false), en('B', false), en('E', false), en('?_4', true),  en('?_5', true),  en('?_6', true),  en('?_7', true) ],
      [ en('F', false), en('F', false), en('F', false), en('E', false), en('?_8', true),  en('?_9', true),  en('?_10', true), en('?_11', true) ],
      [ en('F', false), en('F', false), en('F', false), en('G', false), en('?_12', true), en('?_13', true), en('?_14', true), en('?_15', true) ],
      [ en('F', false), en('F', false), en('F', false), en('H', false), en('?_16', true), en('?_17', true), en('?_18', true),  en('?_19', true) ],
      [ en('I', false), en('J', false), en('K', false), en('K', false), en('?_20', true), en('?_21', true), en('?_22', true),  en('?_23', true) ],
      [ en('h(cic1)_0', true), en('h(cic2)_1', true), en('h(cic3)_2', true), en('h(cic3)_3', true), en('h(cic3)_4', true), en('h(cic4)_5', true), en('h(cic4)_6', true), en('h(cic4)_7', true) ]
    ]
  );
});
