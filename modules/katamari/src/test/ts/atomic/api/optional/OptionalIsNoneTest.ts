import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { Optional } from 'ephox/katamari/api/Optional';

UnitTest.test('Optional.isNone', () => {
  Assert.eq('none is none', true, Optional.none().isNone());
  fc.assert(fc.property(fc.anything(), (x) => {
    Assert.eq('some is not none', false, Optional.some(x).isNone());
  }));
});
