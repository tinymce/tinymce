import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';
import * as Optionals from 'ephox/katamari/api/Optionals';

UnitTest.test('Optionals.mapFrom', () => {
  Assert.eq('eq', 4, Optionals.mapFrom(3, (x) => x + 1).getOrDie());
  Assert.eq('eq', Optional.none(), Optionals.mapFrom<number, number>(null, Fun.die('boom')), tOptional());
  Assert.eq('eq', Optional.none(), Optionals.mapFrom<number, number>(undefined, Fun.die('boom')), tOptional());
});

UnitTest.test('Optionals.mapFrom === Optionals.map().from()', () => {
  const f = (x) => x + 1;

  const check = (input: number | null | undefined) => {
    Assert.eq('eq', true, Optionals.mapFrom(input, f).equals(Optional.from(input).map(f)));
  };

  check(3);
  check(null);
  check(undefined);
});
