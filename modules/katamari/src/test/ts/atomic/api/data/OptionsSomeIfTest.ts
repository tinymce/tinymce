import * as Options from 'ephox/katamari/api/Options';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('OptionSomeIfTest', () => {
  Jsc.property('false -> none', 'number', (n: number) => Jsc.eq(true, Options.someIf<number>(false, n).isNone()));
  Jsc.property('true -> some', 'number', (n: number) => Jsc.eq(n, Options.someIf<number>(true, n).getOrDie()));
});
