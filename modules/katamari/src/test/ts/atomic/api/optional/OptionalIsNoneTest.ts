import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from 'ephox/katamari/api/Optional';
import fc from 'fast-check';

UnitTest.test('Optional.isNone', () => {
  Assert.eq('none is none', true, Optional.none().isNone());
  fc.assert(fc.property(fc.anything(), (x) => {
    Assert.eq('some is not none', false, Optional.some(x).isNone());
  }));
});
