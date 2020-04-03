import * as Arr from 'ephox/katamari/api/Arr';
import * as Unique from 'ephox/katamari/api/Unique';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import * as fc from 'fast-check';
import { Testable } from '@ephox/dispute';

const { tArray, tString } = Testable;

UnitTest.test('Arr.unique: unit tests', () => {
  const expected = [ 'three', 'two', 'one' ];

  const check = (input) => {
    Assert.eq('unique', expected, Unique.stringArray(input));
  };

  check([ 'three', 'two', 'one' ]);
  check([ 'three', 'three', 'two', 'one' ]);
  check([ 'three', 'three', 'two', 'two', 'one' ]);
  check([ 'three', 'three', 'two', 'two', 'one', 'one' ]);
  check([ 'three', 'three', 'two', 'two', 'one', 'one', 'three' ]);
  check([ 'three', 'three', 'two', 'two', 'one', 'one', 'three', 'two' ]);
  check([ 'three', 'three', 'two', 'two', 'one', 'one', 'three', 'two', 'one' ]);
});

UnitTest.test('Arr.unique: each element is not found in the rest of the array', () => {
  fc.assert(fc.property(fc.array(fc.string()), (arr) => {
    const unique = Unique.stringArray(arr);
    return Arr.forall(unique, (x, i) => !Arr.contains(unique.slice(i + 1), x));
  }));
});

UnitTest.test('Arr.unique is idempotent', () => {
  fc.assert(fc.property(fc.array(fc.string()), (arr) => {
    const once = Unique.stringArray(arr);
    const twice = Unique.stringArray(once);
    Assert.eq('idempotent', Arr.sort(once), Arr.sort(twice), tArray(tString));
  }));
});
