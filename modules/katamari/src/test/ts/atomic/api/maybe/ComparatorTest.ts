import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import * as Maybes from 'ephox/katamari/api/Maybes';

describe('atomic.katamari.maybe.ComparatorTest', () => {
  context('is', () => {
    it('is always false for "Nothing"', () => {
      fc.assert(fc.property(fc.anything(), (thing) => {
        const matches = Fun.pipe(
          Maybes.nothing(),
          Maybes.is(thing)
        );

        assert.isFalse(matches);
      }));
    });

    it('is always false for "Nothing" with explicit comparator', () => {
      fc.assert(fc.property(fc.anything(), (thing) => {
        const matches = Fun.pipe(
          Maybes.nothing(),
          Maybes.is(thing, Fun.die('should not be called'))
        );

        assert.isFalse(matches);
      }));
    });

    it('is correct for "Just"', () => {
      fc.assert(fc.property(fc.string(), (thing) => {
        const matches = Fun.pipe(
          Maybes.just(thing),
          Maybes.is(thing)
        );

        assert.isTrue(matches);
      }));

      fc.assert(fc.property(fc.string(), (thing) => {
        const matches = Fun.pipe(
          Maybes.just(thing),
          Maybes.is(thing + 'foo')
        );

        assert.isFalse(matches);
      }));
    });

    it('is correct for "Just" with an explicit comparator', () => {

      // Just an example data type that doesn't have a simple equality
      const thunkEq = (a: () => string, b: () => string): boolean => a() === b();

      fc.assert(fc.property(fc.string(), (thing) => {
        const matches = Fun.pipe(
          Maybes.just(Fun.constant(thing)),
          Maybes.is(Fun.constant(thing), thunkEq)
        );

        assert.isTrue(matches);
      }));

      fc.assert(fc.property(fc.string(), (thing) => {
        const matches = Fun.pipe(
          Maybes.just(Fun.constant(thing)),
          Maybes.is(() => thing + 'foo', thunkEq)
        );

        assert.isFalse(matches);
      }));
    });
  });

  context('equals - without extra argument', () => {
    it('is true for two "Nothing"s', () => {
      assert.isTrue(Maybes.equals(Maybes.nothing(), Maybes.nothing()));
    });

    it('is false for one "Nothing"', () => {
      fc.assert(fc.property(fc.anything(), (thing) => {
        assert.isFalse(Maybes.equals(Maybes.nothing(), Maybes.just(thing)));
        assert.isFalse(Maybes.equals(Maybes.just(thing), Maybes.nothing()));
      }));
    });

    it('compares normally for two "Just"s', () => {
      const different = fc.tuple(fc.anything(), fc.anything()).filter(([ lhs, rhs ]) => lhs !== rhs);
      fc.assert(fc.property(different, ([ lhs, rhs ]) => {
        assert.isFalse(Maybes.equals(Maybes.just(lhs), Maybes.just(rhs)));
      }));

      const theSame = fc.string().map((x) => [ x, x ]);
      fc.assert(fc.property(theSame, ([ lhs, rhs ]) => {
        assert.isTrue(Maybes.equals(Maybes.just(lhs), Maybes.just(rhs)));
      }));
    });
  });

  context('equals - with extra argument', () => {
    const unusedComparator = Fun.die('should not call the comparator');

    it('is true for two "Nothing"s', () => {
      assert.isTrue(Maybes.equals(Maybes.nothing(), Maybes.nothing(), unusedComparator));
    });

    it('is false for one "Nothing"', () => {
      fc.assert(fc.property(fc.anything(), (thing) => {
        assert.isFalse(Maybes.equals(Maybes.nothing(), Maybes.just(thing), unusedComparator));
        assert.isFalse(Maybes.equals(Maybes.just(thing), Maybes.nothing(), unusedComparator));
      }));
    });

    it('compares using the function for two "Just"s', () => {
      const lhs = Maybes.just('left');
      const rhs = Maybes.just('right');

      let numCalled = 0;

      const theSame = Maybes.equals(lhs, rhs, (left, right) => {
        assert.equal(left, 'left');
        assert.equal(right, 'right');
        numCalled += 1;
        return true;
      });
      assert.isTrue(theSame);

      const different = Maybes.equals(lhs, rhs, (left, right) => {
        assert.equal(left, 'left');
        assert.equal(right, 'right');
        numCalled += 1;
        return false;
      });
      assert.isFalse(different);

      assert.equal(numCalled, 2);
    });
  });
});
