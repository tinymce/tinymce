import { assert, UnitTest } from '@ephox/bedrock';
import { Option } from 'ephox/katamari/api/Option';
import * as Options from 'ephox/katamari/api/Options';
import Jsc from '@ephox/wrap-jsverify';

UnitTest.test('OptionsFlattenTest', function () {
  assert.eq(true, Options.flatten(Option.none<Option<string>>()).isNone());
  assert.eq(true, Options.flatten(Option.some(Option.none<string>())).isNone());
  assert.eq('meow', Options.flatten(Option.some(Option.some<string>('meow'))).getOrDie());

  Jsc.property('Checking some', Jsc.number, function (n: number) {
    return Jsc.eq(n, Options.flatten(Option.some(Option.some<number>(n))).getOrDie());
  });
});
