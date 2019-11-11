import * as Arr from 'ephox/katamari/api/Arr';
import { Option } from 'ephox/katamari/api/Option';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { arbNegativeInteger } from 'ephox/katamari/test/arb/ArbDataTypes';
import { Testable } from '@ephox/dispute';

const { tNumber } = Testable;

UnitTest.test('Arr.indexOf: unit tests', () => {
  const checkNoneHelper = (xs, x) => {
    Assert.eq('none', Option.none(), Arr.indexOf(xs, x), tOption());
  };

  const checkNone = (xs: any[], x) => {
    checkNoneHelper(xs, x);
    checkNoneHelper(Object.freeze(xs.slice()), x);
  };

  const checkHelper = (expected, xs, x) => {
    Assert.eq('some', Option.some(expected), Arr.indexOf(xs, x), tOption());
  };

  const check = (expected, xs: any[], x) => {
    checkHelper(expected, xs, x);
    checkHelper(expected, Object.freeze(xs.slice()), x);
  };

  checkNone([], 'x');
  checkNone([ 'q' ], 'x');
  checkNone([ 1 ], '1');
  checkNone([ 1 ], undefined);
  check(0, [ undefined ], undefined);
  check(0, [ undefined, undefined ], undefined);
  check(1, [ 1, undefined ], undefined);
  check(2, [ 'dog', 3, 'cat' ], 'cat');
});

UnitTest.test('Arr.indexOf: find in middle of array', () => {
  fc.assert(fc.property(fc.array(fc.nat()), arbNegativeInteger(), fc.array(fc.nat()), (prefix, element, suffix) => {
    const arr = prefix.concat([ element ]).concat(suffix);
    Assert.eq(
      'Element should be found immediately after the prefix array',
      Option.some(prefix.length),
      Arr.indexOf(arr, element),
      tOption(tNumber)
    );
  }));
});

UnitTest.test('Arr.indexOf: indexOf of an empty array is none', () => {
  fc.property(
    fc.integer(),
    (x) => {
      Assert.eq('indexOf', Option.none(), Arr.indexOf([], x), tOption());
    }
  );
});

UnitTest.test('Arr.indexOf: indexOf of a [value].concat(array) is some(0)', () => {
  fc.property(
    fc.array(fc.integer()),
    fc.integer(),
    (arr, x) => {
      Assert.eq('index', Option.some(0), Arr.indexOf([ x ].concat(arr), x), tOption());
    }
  );
});
