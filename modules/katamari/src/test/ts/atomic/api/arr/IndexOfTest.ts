import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import fc from 'fast-check';
import * as Arr from 'ephox/katamari/api/Arr';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';
import { arbNegativeInteger } from 'ephox/katamari/test/arb/ArbDataTypes';

const { tNumber } = Testable;

UnitTest.test('Arr.indexOf: unit tests', () => {
  const checkNoneHelper = (xs, x) => {
    Assert.eq('none', Optional.none(), Arr.indexOf(xs, x), tOptional());
  };

  const checkNone = (xs: any[], x) => {
    checkNoneHelper(xs, x);
    checkNoneHelper(Object.freeze(xs.slice()), x);
  };

  const checkHelper = (expected, xs, x) => {
    Assert.eq('some', Optional.some(expected), Arr.indexOf(xs, x), tOptional());
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
      Optional.some(prefix.length),
      Arr.indexOf(arr, element),
      tOptional(tNumber)
    );
  }));
});

UnitTest.test('Arr.indexOf: indexOf of an empty array is none', () => {
  fc.property(
    fc.integer(),
    (x) => {
      Assert.eq('indexOf', Optional.none(), Arr.indexOf([], x), tOptional());
    }
  );
});

UnitTest.test('Arr.indexOf: indexOf of a [value].concat(array) is some(0)', () => {
  fc.property(
    fc.array(fc.integer()),
    fc.integer(),
    (arr, x) => {
      Assert.eq('index', Optional.some(0), Arr.indexOf([ x ].concat(arr), x), tOptional());
    }
  );
});
