import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import * as Maybes from 'ephox/katamari/api/Maybes';

describe('atomic.katamari.maybe.FunctorTest', () => {
  it('does not call the map function when mapping on "Nothing"', () => {
    const nothing = Fun.pipe(
      Maybes.nothing(),
      Maybes.map(Fun.die('Should not call mapper as there is nothing to map'))
    );

    assert.isTrue(Maybes.isNothing(nothing));
  });

  it('passes the right value into the map function when mapping on "Just"', () => {
    const output = Fun.pipe(
      Maybes.just('test'),
      Maybes.map((test) => {
        assert.equal(test, 'test');
        return 'other-test';
      })
    );

    if (Maybes.isJust(output)) {
      assert.equal(output.value, 'other-test');
    } else {
      assert.fail('Should not be nothing');
    }
  });

  it('never turns Just to Nothing (or vice versa)', () => {
    const mapper = Maybes.map(Fun.identity);

    const nothing = mapper(Maybes.nothing());
    assert.isTrue(Maybes.isNothing(nothing));

    fc.assert(fc.property(fc.anything(), (thing) => {
      const just = mapper(Maybes.just(thing));
      assert.isTrue(Maybes.isJust(just));
    }));
  });
});
