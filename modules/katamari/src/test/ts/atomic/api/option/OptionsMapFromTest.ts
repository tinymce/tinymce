import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Options from 'ephox/katamari/api/Options';
import { Option } from 'ephox/katamari/api/Option';
import * as Fun from 'ephox/katamari/api/Fun';

UnitTest.test('Options.mapFrom', () => {
  Assert.eq('eq', 4, Options.mapFrom(3, (x) => x + 1).getOrDie());
  Assert.eq('eq', true, Options.mapFrom<number, number>(null, Fun.die('boom')).isNone());
  Assert.eq('eq', true, Options.mapFrom<number, number>(undefined, Fun.die('boom')).isNone());
});

UnitTest.test('Options.mapFrom === Options.map().from()', () => {
  const f = (x) => x + 1;

  const check = (input: number | null | undefined) => {
    Assert.eq('eq', true, Options.mapFrom(input, f).equals(Option.from(input).map(f)));
  };

  check(3);
  check(null);
  check(undefined);
});
