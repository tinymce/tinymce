import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import { assertNone, assertOptional } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.OptionalsMapFromTest', () => {
  it('Optionals.mapFrom', () => {
    assert.equal(Optionals.mapFrom(3, (x) => x + 1).getOrDie(), 4);
    assertNone(Optionals.mapFrom<number, number>(null, Fun.die('boom')));
    assertNone(Optionals.mapFrom<number, number>(undefined, Fun.die('boom')));
  });

  it('Optionals.mapFrom === Optionals.map().from()', () => {
    const f = (x: number) => x + 1;

    const check = (input: number | null | undefined) => {
      assertOptional(Optionals.mapFrom(input, f), Optional.from(input).map(f));
    };

    check(3);
    check(null);
    check(undefined);
  });
});
