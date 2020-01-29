import { Option } from 'ephox/katamari/api/Option';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Option.isSome: none is not some', () => {
  Assert.eq('none is not some', false, Option.none().isSome());
  fc.assert(fc.property(fc.anything(), (x) => {
    Assert.eq('some is some', true, Option.some(x).isSome());
  }));
});
