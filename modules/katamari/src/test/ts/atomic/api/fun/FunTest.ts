import { Assert, context, describe, it, UnitTest } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';

UnitTest.test('Fun: unit tests', () => {
  const add2 = (n) => n + 2;

  const squared = (n) => n * n;

  const add2squared = Fun.compose(squared, add2);

  const f0 = (...args: any[]) => {
    return Assert.eq('eq', 0, args.length);
  };
  Fun.noarg(f0)(1, 2, 3);

  Assert.eq('eq', 16, add2squared(2));

  Assert.eq('eq', undefined, Fun.identity(undefined));
  Assert.eq('eq', 10, Fun.identity(10));
  Assert.eq('eq', [ 1, 2, 4 ], Fun.identity([ 1, 2, 4 ]));
  Assert.eq('eq', { a: 'a', b: 'b' }, Fun.identity({ a: 'a', b: 'b' }));

  Assert.eq('eq', undefined, Fun.constant(undefined)());
  Assert.eq('eq', 10, Fun.constant(10)());
  Assert.eq('eq', { a: 'a' }, Fun.constant({ a: 'a' })());

  Assert.eq('eq', false, Fun.never());
  Assert.eq('eq', true, Fun.always());

  const c = (...args) => args;

  Assert.eq('eq', [], Fun.curry(c)());
  Assert.eq('eq', [ 'a' ], Fun.curry(c, 'a')());
  Assert.eq('eq', [ 'a', 'b' ], Fun.curry(c, 'a')('b'));
  Assert.eq('eq', [ 'a', 'b' ], Fun.curry(c)('a', 'b'));
  Assert.eq('eq', [ 'a', 'b', 'c' ], Fun.curry(c)('a', 'b', 'c'));
  Assert.eq('eq', [ 'a', 'b', 'c' ], Fun.curry(c, 'a', 'b')('c'));

  Assert.eq('eq', false, Fun.not((_x: number) => true)(3));
  Assert.eq('eq', true, Fun.not((_x: string) => false)('cat'));

  Assert.throws('should die', Fun.die('Died!'));

  let called = false;
  const f = () => {
    called = true;
  };
  Fun.apply(f);
  Assert.eq('eq', true, called);
  called = false;
  Fun.apply(f);
  Assert.eq('eq', true, called);
});

UnitTest.test('Check compose :: compose(f, g)(x) = f(g(x))', () => {
  fc.assert(fc.property(fc.string(), fc.func(fc.string()), fc.func(fc.string()), (x, f, g) => {
    const h = Fun.compose(f, g);
    Assert.eq('eq', f(g(x)), h(x));
  }));
});

UnitTest.test('Check compose1 :: compose1(f, g)(x) = f(g(x))', () => {
  fc.assert(fc.property(fc.string(), fc.func(fc.string()), fc.func(fc.string()), (x, f, g) => {
    const h = Fun.compose1(f, g);
    Assert.eq('eq', f(g(x)), h(x));
  }));
});

UnitTest.test('Check constant :: constant(a)() === a', () => {
  fc.assert(fc.property(fc.json(), (json) => {
    Assert.eq('eq', json, Fun.constant(json)());
  }));
});

UnitTest.test('Check identity :: identity(a) === a', () => {
  fc.assert(fc.property(fc.json(), (json) => {
    Assert.eq('eq', json, Fun.identity(json));
  }));
});

UnitTest.test('Check always :: f(x) === true', () => {
  fc.assert(fc.property(fc.json(), (json) => {
    Assert.eq('eq', true, Fun.always(json));
  }));
});

UnitTest.test('Check never :: f(x) === false', () => {
  fc.assert(fc.property(fc.json(), (json) => {
    Assert.eq('eq', false, Fun.never(json));
  }));
});

UnitTest.test('Check curry', () => {
  fc.assert(fc.property(fc.json(), fc.json(), fc.json(), fc.json(), (a, b, c, d) => {
    const f = (a, b, c, d) => [ a, b, c, d ];

    Assert.eq('curry 1', Fun.curry(f, a)(b, c, d), [ a, b, c, d ]);
    Assert.eq('curry 2', Fun.curry(f, a, b)(c, d), [ a, b, c, d ]);
    Assert.eq('curry 3', Fun.curry(f, a, b, c)(d), [ a, b, c, d ]);
    Assert.eq('curry 4', Fun.curry(f, a, b, c, d)(), [ a, b, c, d ]);
  }));
});

UnitTest.test('Check not :: not(f(x)) === !f(x)', () => {
  fc.assert(fc.property(fc.json(), fc.func(fc.boolean()), (x, f) => {
    const g = Fun.not(f);
    Assert.eq('eq', f(x), !g(x));
  }));
});

UnitTest.test('Check not :: not(not(f(x))) === f(x)', () => {
  fc.assert(fc.property(fc.json(), fc.func(fc.boolean()), (x, f) => {
    const g = Fun.not(Fun.not(f));
    Assert.eq('eq', f(x), g(x));
  }));
});

UnitTest.test('Check apply :: apply(constant(a)) === a', () => {
  fc.assert(fc.property(fc.json(), (x) => {
    Assert.eq('eq', x, Fun.apply(Fun.constant(x)));
  }));
});

UnitTest.test('Check call :: apply(constant(a)) === undefined', () => {
  fc.assert(fc.property(fc.json(), (x) => {
    let hack: any = null;
    const output = Fun.call(() => {
      hack = x;
    });

    Assert.eq('eq', undefined, output);
    Assert.eq('eq', x, hack);
  }));
});

describe('katamari.Fun', () => {
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
