import * as Options from 'ephox/katamari/api/Options';
import { Option } from 'ephox/katamari/api/Option';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import fc from 'fast-check';
import { UnitTest, Assert } from '@ephox/bedrock-client';

UnitTest.test('Option.someIf: false -> none', () => {
  fc.assert(fc.property(fc.integer(), (n) => {
    Assert.eq('eq', Option.none(), Options.someIf<number>(false, n), tOption());
  }));
});

UnitTest.test('Option.someIf: true -> some', () => {
  fc.assert(fc.property(fc.integer(), (n) => {
    Assert.eq('eq', Option.some(n), Options.someIf<number>(true, n), tOption());
  }));
});
