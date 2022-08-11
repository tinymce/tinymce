import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';

describe('atomic.katamari.api.fun.FunTest', () => {
  it('unit tests', () => {
    const add2 = (n: number) => n + 2;

    const squared = (n: number) => n * n;

    const add2squared = Fun.compose(squared, add2);

    const f0 = (...args: any[]) => {
      return assert.lengthOf(args, 0);
    };
    Fun.noarg(f0)(1, 2, 3);

    assert.equal(add2squared(2), 16);

    assert.isUndefined(Fun.identity(undefined));
    assert.equal(Fun.identity(10), 10);
    assert.deepEqual(Fun.identity([ 1, 2, 4 ]), [ 1, 2, 4 ]);
    assert.deepEqual(Fun.identity({ a: 'a', b: 'b' }), { a: 'a', b: 'b' });

    assert.isUndefined(Fun.constant(undefined)());
    assert.equal(Fun.constant(10)(), 10);
    assert.deepEqual(Fun.constant({ a: 'a' })(), { a: 'a' });

    assert.isFalse(Fun.never());
    assert.isTrue(Fun.always());

    const c = <T>(...args: T[]): T[] => args;

    assert.deepEqual(Fun.curry(c)(), []);
    assert.deepEqual(Fun.curry(c, 'a')(), [ 'a' ]);
    assert.deepEqual(Fun.curry(c, 'a')('b'), [ 'a', 'b' ]);
    assert.deepEqual(Fun.curry(c)('a', 'b'), [ 'a', 'b' ]);
    assert.deepEqual(Fun.curry(c)('a', 'b', 'c'), [ 'a', 'b', 'c' ]);
    assert.deepEqual(Fun.curry(c, 'a', 'b')('c'), [ 'a', 'b', 'c' ]);

    assert.isFalse(Fun.not((_x: number) => true)(3));
    assert.isTrue(Fun.not((_x: string) => false)('cat'));

    assert.throws(Fun.die('Died!'));

    let called = false;
    const f = () => {
      called = true;
    };
    Fun.apply(f);
    assert.isTrue(called);
    called = false;
    Fun.apply(f);
    assert.isTrue(called);
  });

  it('Check compose :: compose(f, g)(x) = f(g(x))', () => {
    fc.assert(fc.property(fc.string(), fc.func(fc.string()), fc.func(fc.string()), (x, f, g) => {
      const h = Fun.compose(f, g);
      assert.deepEqual(h(x), f(g(x)));
    }));
  });

  it('Check compose1 :: compose1(f, g)(x) = f(g(x))', () => {
    fc.assert(fc.property(fc.string(), fc.func(fc.string()), fc.func(fc.string()), (x, f, g) => {
      const h = Fun.compose1(f, g);
      assert.deepEqual(h(x), f(g(x)));
    }));
  });

  it('Check constant :: constant(a)() === a', () => {
    fc.assert(fc.property(fc.json(), (json) => {
      assert.deepEqual(Fun.constant(json)(), json);
    }));
  });

  it('Check identity :: identity(a) === a', () => {
    fc.assert(fc.property(fc.json(), (json) => {
      assert.deepEqual(Fun.identity(json), json);
    }));
  });

  it('Check always :: f(x) === true', () => {
    fc.assert(fc.property(fc.json(), (json) => {
      assert.isTrue(Fun.always(json));
    }));
  });

  it('Check never :: f(x) === false', () => {
    fc.assert(fc.property(fc.json(), (json) => {
      assert.isFalse(Fun.never(json));
    }));
  });

  it('Check curry', () => {
    fc.assert(fc.property(fc.json(), fc.json(), fc.json(), fc.json(), (a, b, c, d) => {
      const f = (a: string, b: string, c: string, d: string) => [ a, b, c, d ];

      assert.deepEqual([ a, b, c, d ], Fun.curry(f, a)(b, c, d));
      assert.deepEqual([ a, b, c, d ], Fun.curry(f, a, b)(c, d));
      assert.deepEqual([ a, b, c, d ], Fun.curry(f, a, b, c)(d));
      assert.deepEqual([ a, b, c, d ], Fun.curry(f, a, b, c, d)());
    }));
  });

  it('Check not :: not(f(x)) === !f(x)', () => {
    fc.assert(fc.property(fc.json(), fc.func(fc.boolean()), (x, f) => {
      const g = Fun.not(f);
      assert.deepEqual(!g(x), f(x));
    }));
  });

  it('Check not :: not(not(f(x))) === f(x)', () => {
    fc.assert(fc.property(fc.json(), fc.func(fc.boolean()), (x, f) => {
      const g = Fun.not(Fun.not(f));
      assert.deepEqual(g(x), f(x));
    }));
  });

  it('Check apply :: apply(constant(a)) === a', () => {
    fc.assert(fc.property(fc.json(), (x) => {
      assert.deepEqual(Fun.apply(Fun.constant(x)), x);
    }));
  });

  it('Check call :: apply(constant(a)) === undefined', () => {
    fc.assert(fc.property(fc.json(), (x) => {
      let hack: any = null;
      const output = Fun.call(() => {
        hack = x;
      });

      assert.isUndefined(output);
      assert.deepEqual(hack, x);
    }));
  });

  context('pipe', () => {
    const maker = <T, U>(from: T, to: U): (input: T) => U => (input) => {
      assert.deepEqual(input, from);
      return to;
    };

    it('Works for 1 function', () => {
      assert.equal(Fun.pipe('a', maker('a', 1)), 1);
      assert.equal(Fun.pipe(undefined, maker(undefined, 'output')), 'output');
    });

    it('Works for 2 functions', () => {
      assert.equal(Fun.pipe('a', maker('a', 1), maker(1, null)), null);
      assert.equal(Fun.pipe([], maker([], 'a'), maker('a', 3)), 3);
    });

    it('Works for 3 functions', () => {
      assert.equal(Fun.pipe({}, maker({}, 'a'), maker('a', 1), maker(1, null)), null);
    });

    it('Works for 4 functions', () => {
      assert.equal(Fun.pipe('a', maker('a', 1), maker(1, []), maker([], {}), maker({}, null)), null);
    });

    it('Works for 5 functions', () => {
      assert.equal(Fun.pipe('a', maker('a', 1), maker(1, []), maker([], {}), maker({}, null), maker(null, undefined)), undefined);
    });

    it('Works for 6 functions', () => {
      assert.equal(Fun.pipe('a', maker('a', 1), maker(1, []), maker([], {}), maker({}, null), maker(null, undefined), maker(undefined, 'out-of-types')), 'out-of-types');
    });

    it('Works for 7 functions', () => {
      assert.equal(Fun.pipe(1, maker(1, 2), maker(2, 3), maker(3, 4), maker(4, 5), maker(5, 6), maker(6, 7), maker(7, 8)), 8);
    });

    // Fun.pipe currently maxes out at 7 functions - if you need more please reconsider (or just add more)
  });
});
