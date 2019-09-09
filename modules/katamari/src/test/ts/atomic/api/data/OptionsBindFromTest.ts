import { assert, UnitTest } from '@ephox/bedrock';
import * as Options from 'ephox/katamari/api/Options';
import { Option } from 'ephox/katamari/api/Option';
import * as Fun from 'ephox/katamari/api/Fun';

UnitTest.test('Options.bindFrom', () => {
  assert.eq(4, Options.bindFrom(3, (x) => Option.some(x + 1)).getOrDie());
  assert.eq(true, Options.bindFrom(3, (x) => Option.none()).isNone());
  assert.eq(true, Options.bindFrom<number, number>(null, Fun.die('boom')).isNone());
  assert.eq(true, Options.bindFrom<number, number>(undefined, Fun.die('boom')).isNone());
});

UnitTest.test('Options.bindFrom === Options.bind().from()', () => {
  function check(input: number | null | undefined, f: (a: number) => Option<number>) {
    assert.eq(true, Options.bindFrom(input, f).equals(Option.from(input).bind(f)));
  }

  const s = (x: number) => Option.some<number>(x + 1);
  const n = (x: number) => Option.none<number>();

  check(3, s);
  check(null, s);
  check(undefined, s);

  check(3, n);
  check(null, n);
  check(undefined, n);
});
