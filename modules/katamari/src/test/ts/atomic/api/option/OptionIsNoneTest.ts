import { Option } from 'ephox/katamari/api/Option';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Option.isNone', () => {
  Assert.eq('none is none', true, Option.none().isNone());
  fc.assert(fc.property(fc.anything(), (x) => {
    Assert.eq('some is not none', false, Option.some(x).isNone());
  }));
});
