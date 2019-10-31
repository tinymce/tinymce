import * as Arr from 'ephox/katamari/api/Arr';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable as T } from '@ephox/dispute';
import fc from 'fast-check';

UnitTest.test('Arr.sort: unit test', () => {
  Assert.eq('sort array', [ 1, 2, 3 ], Arr.sort([ 1, 3, 2 ]), T.tArray(T.tNumber));
  Assert.eq('sort frozen array', [ 1, 2, 3 ], Arr.sort(Object.freeze([ 1, 3, 2 ])), T.tArray(T.tNumber));
});

UnitTest.test('Arr.sort: idempotency', () => {
  fc.assert(fc.property(
    fc.array(fc.nat()), (arr) => {
      Assert.eq('idempotency', Arr.sort(arr), Arr.sort(Arr.sort(arr)), T.tArray(T.tNumber));
    }
  ));
});
