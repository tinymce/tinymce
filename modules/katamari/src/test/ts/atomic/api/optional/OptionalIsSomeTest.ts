import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { Optional } from 'ephox/katamari/api/Optional';

UnitTest.test('Optional.isSome: none is not some', () => {
  Assert.eq('none is not some', false, Optional.none().isSome());
  fc.assert(fc.property(fc.anything(), (x) => {
    Assert.eq('some is some', true, Optional.some(x).isSome());
  }));
});
