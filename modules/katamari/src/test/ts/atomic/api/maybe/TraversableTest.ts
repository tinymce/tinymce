import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Fun from 'ephox/katamari/api/Fun';
import * as Maybes from 'ephox/katamari/api/Maybes';

describe('atomic.katamari.maybe.TraversableTest', () => {
  context('exists', () => {
    it('returns false for Nothing', () => {
      const exists = Maybes.exists(Fun.die('Should not call the callback'))(Maybes.nothing());
      assert.isFalse(exists);
    });

    it('passes the correct values through the callback', () => {
      Fun.pipe(
        Maybes.just('test'),
        Maybes.exists((test) => {
          assert.equal(test, 'test');
          return false;
        })
      );

      const doesNotExist = Fun.pipe(
        Maybes.just('test'),
        Maybes.exists(Fun.never)
      );
      assert.isFalse(doesNotExist);

      const doesExist = Fun.pipe(
        Maybes.just('test'),
        Maybes.exists(Fun.always)
      );
      assert.isTrue(doesExist);
    });
  });

  context('forAll', () => {
    it('returns true for Nothing', () => {
      const forAll = Maybes.forall(Fun.die('Should not call the callback'))(Maybes.nothing());
      assert.isTrue(forAll);
    });

    it('passes the correct values through the callback', () => {
      Fun.pipe(
        Maybes.just('test'),
        Maybes.forall((test) => {
          assert.equal(test, 'test');
          return false;
        })
      );

      const doesNotHoldForAll = Fun.pipe(
        Maybes.just('test'),
        Maybes.forall(Fun.never)
      );
      assert.isFalse(doesNotHoldForAll);

      const holdsForAll = Fun.pipe(
        Maybes.just('test'),
        Maybes.forall(Fun.always)
      );
      assert.isTrue(holdsForAll);
    });
  });

  context('filter', () => {
    it('does nothing with Nothing', () => {
      const nothing = Fun.pipe(
        Maybes.nothing(),
        Maybes.filter(Fun.die('Should not call the callback'))
      );

      assert.isTrue(Maybes.isNothing(nothing));
    });

    it('passes the correct values through the callback', () => {
      Fun.pipe(
        Maybes.just('test'),
        Maybes.filter((val) => {
          assert.equal(val, 'test');
          return false;
        })
      );

      const nothing = Fun.pipe(
        Maybes.just('test'),
        Maybes.filter(Fun.never)
      );
      assert.isTrue(Maybes.isNothing(nothing));

      const just = Fun.pipe(
        Maybes.just('test'),
        Maybes.filter(Fun.always)
      );
      if (Maybes.isJust(just)) {
        assert.equal(just.value, 'test');
      } else {
        assert.fail('Should not be nothing');
      }
    });
  });
});
