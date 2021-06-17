import { context, describe } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Fun from 'ephox/katamari/api/Fun';
import { Maybe } from 'ephox/katamari/api/Maybe';
import * as Maybes from 'ephox/katamari/api/Maybes';

const boom = Fun.die('this should not be called');
const nothing = Maybes.nothing<never>();
const x = Maybes.just('x');
const y = Maybes.just('y');
const z = Maybes.just('z');
const t = Maybes.just('t');
const u = Maybes.just('u');

const assertNothing = <T>(maybe: Maybe<T>) => assert.isTrue(Maybes.isNothing(maybe));
const assertJust = <T>(maybe: Maybe<T>, value: T) => {
  if (Maybes.isJust(maybe)) {
    assert.equal(maybe.value, value);
  } else {
    assert.fail('expected maybe to be just');
  }
};

describe('atomic.katamari.maybe.ApplicativeTest', () => {
  context('lift2', () => {
    assertNothing(Maybes.lift2(nothing, nothing, boom));

    assertNothing(Maybes.lift2(nothing, x, boom));
    assertNothing(Maybes.lift2(x, nothing, boom));

    assertJust(Maybes.lift2(x, y, (a, b) => a + b), 'xy');
  });

  context('lift3', () => {
    assertNothing(Maybes.lift3(nothing, nothing, nothing, boom));

    assertNothing(Maybes.lift3(nothing, nothing, x, boom));
    assertNothing(Maybes.lift3(nothing, x, nothing, boom));
    assertNothing(Maybes.lift3(x, nothing, nothing, boom));

    assertNothing(Maybes.lift3(x, y, nothing, boom));
    assertNothing(Maybes.lift3(x, nothing, y, boom));
    assertNothing(Maybes.lift3(nothing, x, y, boom));

    assertJust(Maybes.lift3(x, y, z, (a, b, c) => a + b + c), 'xyz');
  });

  context('lift4', () => {
    assertNothing(Maybes.lift4(nothing, nothing, nothing, nothing, boom));

    assertNothing(Maybes.lift4(nothing, nothing, nothing, x, boom));
    assertNothing(Maybes.lift4(nothing, nothing, x, nothing, boom));
    assertNothing(Maybes.lift4(nothing, x, nothing, nothing, boom));
    assertNothing(Maybes.lift4(x, nothing, nothing, nothing, boom));

    assertNothing(Maybes.lift4(nothing, nothing, x, y, boom));
    assertNothing(Maybes.lift4(nothing, x, nothing, y, boom));
    assertNothing(Maybes.lift4(nothing, x, y, nothing, boom));
    assertNothing(Maybes.lift4(x, nothing, nothing, y, boom));
    assertNothing(Maybes.lift4(x, nothing, y, nothing, boom));
    assertNothing(Maybes.lift4(x, y, nothing, nothing, boom));

    assertNothing(Maybes.lift4(nothing, x, y, z, boom));
    assertNothing(Maybes.lift4(x, nothing, y, z, boom));
    assertNothing(Maybes.lift4(x, y, nothing, z, boom));
    assertNothing(Maybes.lift4(x, y, z, nothing, boom));

    assertJust(Maybes.lift4(x, y, z, t, (a, b, c, d) => a + b + c + d), 'xyzt');
  });

  context('lift5', () => {
    assertNothing(Maybes.lift5(nothing, nothing, nothing, nothing, nothing, boom));

    assertNothing(Maybes.lift5(nothing, nothing, nothing, nothing, x, boom));
    assertNothing(Maybes.lift5(nothing, nothing, nothing, x, nothing, boom));
    assertNothing(Maybes.lift5(nothing, nothing, x, nothing, nothing, boom));
    assertNothing(Maybes.lift5(nothing, x, nothing, nothing, nothing, boom));
    assertNothing(Maybes.lift5(x, nothing, nothing, nothing, nothing, boom));

    assertNothing(Maybes.lift5(nothing, nothing, nothing, x, y, boom));
    assertNothing(Maybes.lift5(nothing, nothing, x, nothing, y, boom));
    assertNothing(Maybes.lift5(nothing, nothing, x, y, nothing, boom));
    assertNothing(Maybes.lift5(nothing, x, nothing, nothing, y, boom));
    assertNothing(Maybes.lift5(nothing, x, nothing, y, nothing, boom));
    assertNothing(Maybes.lift5(nothing, x, y, nothing, nothing, boom));
    assertNothing(Maybes.lift5(x, nothing, nothing, nothing, y, boom));
    assertNothing(Maybes.lift5(x, nothing, nothing, y, nothing, boom));
    assertNothing(Maybes.lift5(x, nothing, y, nothing, nothing, boom));
    assertNothing(Maybes.lift5(x, y, nothing, nothing, nothing, boom));

    assertNothing(Maybes.lift5(nothing, nothing, x, y, z, boom));
    assertNothing(Maybes.lift5(nothing, x, nothing, y, z, boom));
    assertNothing(Maybes.lift5(nothing, x, y, nothing, z, boom));
    assertNothing(Maybes.lift5(nothing, x, y, z, nothing, boom));
    assertNothing(Maybes.lift5(x, nothing, nothing, y, z, boom));
    assertNothing(Maybes.lift5(x, nothing, y, nothing, z, boom));
    assertNothing(Maybes.lift5(x, nothing, y, z, nothing, boom));
    assertNothing(Maybes.lift5(x, y, nothing, nothing, z, boom));
    assertNothing(Maybes.lift5(x, y, nothing, z, nothing, boom));
    assertNothing(Maybes.lift5(x, y, z, nothing, nothing, boom));

    assertNothing(Maybes.lift5(nothing, x, y, z, t, boom));
    assertNothing(Maybes.lift5(x, nothing, y, z, t, boom));
    assertNothing(Maybes.lift5(x, y, nothing, z, t, boom));
    assertNothing(Maybes.lift5(x, y, z, nothing, t, boom));
    assertNothing(Maybes.lift5(x, y, z, t, nothing, boom));

    assertJust(Maybes.lift5(x, y, z, t, u, (a, b, c, d, e) => a + b + c + d + e), 'xyztu');
  });
});