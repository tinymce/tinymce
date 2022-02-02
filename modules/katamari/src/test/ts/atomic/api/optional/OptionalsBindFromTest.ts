import { describe, it } from '@ephox/bedrock-client';

import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import { assertOptional } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.OptionalsBindFromTest', () => {
  it('Optionals.bindFrom', () => {
    assertOptional(Optionals.bindFrom(3, (x) => Optional.some(x + 1)), Optional.some(4));
    assertOptional(Optionals.bindFrom(3, (_x) => Optional.none()), Optional.none());
    assertOptional(Optionals.bindFrom<number, number>(null, Fun.die('boom')), Optional.none());
    assertOptional(Optionals.bindFrom<number, number>(undefined, Fun.die('boom')), Optional.none());
  });

  it('Optionals.bindFrom === Optionals.bind().from()', () => {
    const check = (input: number | null | undefined, f: (a: number) => Optional<number>) => {
      assertOptional(Optionals.bindFrom(input, f), Optional.from(input).bind(f));
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
});
