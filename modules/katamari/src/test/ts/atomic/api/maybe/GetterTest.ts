import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import * as Maybes from 'ephox/katamari/api/Maybes';

describe('atomic.katamari.maybe.GetterTest', () => {
  context('getOr', () => {
    it('gives the default on "Nothing"', () => {
      const input = 4;
      const output = Fun.pipe(
        Maybes.nothing(),
        Maybes.getOr(input)
      );
      assert.equal(output, input);
    });

    it('gives the actual value on "Just"', () => {
      const input = 4;
      const output = Fun.pipe(
        Maybes.just(input),
        Maybes.getOr('wrong-value')
      );
      assert.equal(output, input);
    });
  });

  context('getOrDie', () => {
    it('dies on "Nothing"', () => {
      assert.throws(() => Maybes.getOrDie(Maybes.nothing()));
    });

    it('gets the value on "Just"', () => {
      fc.assert(fc.property(fc.string(), (s) => {
        const val = Fun.pipe(
          Maybes.just(s),
          Maybes.getOrDie
        );
        assert.equal(val, s);
      }));
    });
  });

  context('getOrThunk', () => {
    it('calls the function on "Nothing"', () => {
      let called = false;
      const input = 3;
      const output = Fun.pipe(
        Maybes.nothing(),
        Maybes.getOrThunk(() => {
          called = true;
          return input;
        })
      );
      assert.equal(output, input);
      assert.isTrue(called);
    });

    it('does not call the function on "Just"', () => {
      const input = 3;
      const output = Fun.pipe(
        Maybes.just(input),
        Maybes.getOrThunk(Fun.die('should not call the function'))
      );
      assert.equal(output, input);
    });
  });
});
