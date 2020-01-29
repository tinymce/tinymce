import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Option } from 'ephox/katamari/api/Option';
import * as Options from 'ephox/katamari/api/Options';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import fc from 'fast-check';

UnitTest.test('Options.flatten: unit tests', function () {
  Assert.eq('none', Option.none(), Options.flatten(Option.none<Option<string>>()), tOption());
  Assert.eq('some(none)', Option.none(), Options.flatten(Option.some(Option.none<string>())), tOption());
  Assert.eq('some(some)', Option.some('meow'), Options.flatten(Option.some(Option.some<string>('meow'))), tOption());
});

UnitTest.test('Options.flatten: some(some(x))', () => {
  fc.assert(fc.property(fc.integer(), function (n) {
    Assert.eq('eq', Option.some(n), Options.flatten(Option.some(Option.some<number>(n))), tOption());
  }));
});
