import * as Options from 'ephox/katamari/api/Options';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('OptionSomeIfTest', () => {
  Jsc.property('false -> none', 'string', (s: string) => Jsc.eq(true, Options.someIf<string>(false, s).isNone()));
  Jsc.property('true -> some', 'string', (s: string) => Jsc.eq(s, Options.someIf<string>(true, s).getOrDie()));
});
