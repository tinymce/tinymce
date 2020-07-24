import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';
import * as Optionals from 'ephox/katamari/api/Optionals';

const { tNumber } = Testable;

UnitTest.test('Optionals.bindFrom', () => {
  Assert.eq('bindFrom value to some', Optional.some(4), Optionals.bindFrom(3, (x) => Optional.some(x + 1)), tOptional(tNumber));
  Assert.eq('bindFrom value to none', Optional.none(), Optionals.bindFrom(3, (_x) => Optional.none()), tOptional(tNumber));
  Assert.eq('bindFrom null', Optional.none(), Optionals.bindFrom<number, number>(null, Fun.die('boom')), tOptional());
  Assert.eq('bindFrom undefined', Optional.none(), Optionals.bindFrom<number, number>(undefined, Fun.die('boom')), tOptional(tNumber));
});

UnitTest.test('Optionals.bindFrom === Optionals.bind().from()', () => {
  const check = (input: number | null | undefined, f: (a: number) => Optional<number>) => {
    Assert.eq('bindFrom equivalent ot bind', Optional.from(input).bind(f), Optionals.bindFrom(input, f), tOptional(tNumber));
  };

  const s = (x: number) => Optional.some<number>(x + 1);
  const n = (_x: number) => Optional.none<number>();

  check(3, s);
  check(null, s);
  check(undefined, s);

  check(3, n);
  check(null, n);
  check(undefined, n);
});
