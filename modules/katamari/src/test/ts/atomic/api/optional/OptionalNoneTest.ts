import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import { assertNone } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.OptionalNoneTest', () => {
  it('unit tests', () => {
    const s = Optional.none<number>();
    assert.throws(() => {
      s.getOrDie('Died!');
    });
    assert.deepEqual(s.or(Optional.some(6)).getOrDie(), 6);
    assert.deepEqual(s.orThunk(() => Optional.some(6)).getOrDie(), 6);

    assertNone(s.map((v) => v * 2));
    assertNone(s.map(Fun.die('boom')));

    assertNone(s.bind((v) => Optional.some('test' + v)));

    assertNone(Optional.from(null));
    assertNone(Optional.from(undefined));

    assert.deepEqual(Optional.none().or(Optional.some(7)).equals(Optional.some(7)), true);
    assert.deepEqual(Optional.none().or(Optional.none()).equals(Optional.none()), true);

    assert.deepEqual(Optional.none().toArray(), []);

    assert.deepEqual(Optional.none().fold(() => 'zz', Fun.die('boom')), 'zz');
    assert.deepEqual(Optional.none().fold((...args: any[]) => {
      return args;
    }, Fun.die('boom')), []);

    assert.deepEqual(Optional.none().fold(Fun.constant('b'), Fun.die('boom')), 'b');
    assertNone(Optional.none().bind(Fun.die('boom')));
    assert.deepEqual(Optional.none().each(Fun.die('boom')), undefined);

    assert.deepEqual(Optional.none().forall(Fun.die('boom')), true);
    assert.deepEqual(Optional.none().exists(Fun.die('boom')), false);

    assert.deepEqual(Optional.none().toString(), 'none()');
  });

  it('Checking none.fold(_ -> x, die) === x', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      const actual = Optional.none<string>().fold(Fun.constant(i), Fun.die('Should not be called'));
      assert.deepEqual(actual, i);
    }));
  });

  it('Checking none.is === false', () => {
    fc.assert(fc.property(fc.integer(), (v) => {
      assert.deepEqual(Optional.none<number>().is(v), false);
    }));
  });

  it('Checking none.getOr(v) === v', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      assert.deepEqual(Optional.none<number>().getOr(i), i);
    }));
  });

  it('Checking none.getOrThunk(_ -> v) === v', () => {
    fc.assert(fc.property(fc.func(fc.integer()), (thunk) => {
      assert.deepEqual(Optional.none<number>().getOrThunk(thunk), thunk());
    }));
  });

  it('Checking none.getOrDie() always throws', () => {
  // Require non empty string of msg falsiness gets in the way.
    fc.assert(fc.property(fc.string(1, 40), (s) => {
      assert.throws(() => {
        Optional.none().getOrDie(s);
      });
    }));
  });

  it('Checking none.or(oSomeValue) === oSomeValue', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      const output = Optional.none().or(Optional.some(i));
      assert.isTrue(output.is(i));
    }));
  });

  it('Checking none.orThunk(_ -> v) === v', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      const output = Optional.none().orThunk(() => Optional.some(i));
      assert.isTrue(output.is(i));
    }));
  });
});
