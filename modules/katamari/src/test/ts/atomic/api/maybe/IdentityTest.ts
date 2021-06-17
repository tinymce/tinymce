import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import * as Maybes from 'ephox/katamari/api/Maybes';

describe('atomic.katamari.maybe.IdentityTest', () => {
  it('allows creating "Just" maybes', () => {
    fc.assert(fc.property(fc.anything(), (thing) => {
      const item = Maybes.just(thing);
      assert.isTrue(Maybes.isJust(item));
      assert.isFalse(Maybes.isNothing(item));
    }));
  });

  it('allows creating "Nothing" maybes', () => {
    const item = Maybes.nothing();
    assert.isFalse(Maybes.isJust(item));
    assert.isTrue(Maybes.isNothing(item));
  });

  it('allows folding on "Just" maybes', () => {
    // Simple value, complex assertions
    Fun.pipe(
      Maybes.just('test'),
      Maybes.fold(
        Fun.die('Should call other branch'),
        (test) => {
          assert.equal(test, 'test');
          return 'other-test';
        }
      ),
      (result) => assert.equal(result, 'other-test')
    );

    // Complex values, simple assertions
    fc.assert(fc.property(fc.anything(), (thing) => {
      Fun.pipe(
        Maybes.just(thing),
        Maybes.fold(Fun.die('Should call other branch'), Fun.noop)
      );
    }));
  });

  it('allows folding on "Nothing" maybes', () => {
    Fun.pipe(
      Maybes.nothing(),
      Maybes.fold(
        (...args) => {
          assert.isEmpty(args);
          return 'other-test';
        },
        Fun.die('Should call other branch')
      ),
      (result) => assert.equal(result, 'other-test')
    );
  });
});