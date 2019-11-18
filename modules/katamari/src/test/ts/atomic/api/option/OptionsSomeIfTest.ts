import * as Options from 'ephox/katamari/api/Options';
import fc from 'fast-check';
import { UnitTest, Assert } from '@ephox/bedrock-client';

UnitTest.test('Option.someIf: false -> none', () => {
  fc.assert(fc.property(fc.integer(), (n) => {
    Assert.eq('eq', true, Options.someIf<number>(false, n).isNone());
  }));
});

UnitTest.test('Option.someIf: true -> some', () => {
  fc.assert(fc.property(fc.integer(), (n) => {
    Assert.eq('eq', n, Options.someIf<number>(true, n).getOrDie());
  }));
});
