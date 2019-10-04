import { assert, UnitTest } from '@ephox/bedrock';
import * as Options from 'ephox/katamari/api/Options';
import { Option } from 'ephox/katamari/api/Option';
import * as Fun from 'ephox/katamari/api/Fun';

UnitTest.test('Options.mapFrom', () => {
  assert.eq(4, Options.mapFrom(3, (x) => x + 1).getOrDie());
  assert.eq(true, Options.mapFrom<number, number>(null, Fun.die('boom')).isNone());
  assert.eq(true, Options.mapFrom<number, number>(undefined, Fun.die('boom')).isNone());
});

UnitTest.test('Options.mapFrom === Options.map().from()', () => {
  const f = (x) => x + 1;

  function check(input: number | null | undefined) {
    assert.eq(true, Options.mapFrom(input, f).equals(Option.from(input).map(f)));
  }

  check(3);
  check(null);
  check(undefined);
});
