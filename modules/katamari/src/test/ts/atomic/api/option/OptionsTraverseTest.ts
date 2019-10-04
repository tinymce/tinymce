import { assert, UnitTest } from '@ephox/bedrock';
import * as Options from 'ephox/katamari/api/Options';
import { Option } from 'ephox/katamari/api/Option';

UnitTest.test('Options.traverse - unit tests', () => {
  assert.eq([], Options.traverse<number, string>(
    [],
    (x: number): Option<string> => { throw Error('no'); }
  ).getOrDie());

  assert.eq(['3cat'], Options.traverse<number, string>(
    [3],
    (x: number): Option<string> => Option.some(x + 'cat')
    ).getOrDie());

  assert.eq(true, Options.traverse<number, string>(
    [3],
    (x: number): Option<string> => Option.none()
    ).isNone());

  assert.eq(true, Options.traverse<number, number>(
    [3, 4],
    (x: number): Option<number> => Options.someIf(x === 3, x)
    ).isNone());

});
