import * as Thunk from 'ephox/katamari/api/Thunk';
import fc from 'fast-check';
import { UnitTest, Assert } from '@ephox/bedrock-client';

UnitTest.test('ThunkTest', function () {
  const testSanity = function () {
    let args: any[] | null = null;
    const f = Thunk.cached(function () {
      args = Array.prototype.slice.call(arguments);
      return args;
    });
    const r1 = f('a');
    Assert.eq('eq', [ 'a' ], args);
    Assert.eq('eq', [ 'a' ], r1);
    const r2 = f('b');
    Assert.eq('eq', [ 'a' ], args);
    Assert.eq('eq', [ 'a' ], r2);
  };
});

UnitTest.test('Thunk.cached counter', () => {
  fc.assert(fc.property(fc.json(), fc.func(fc.json()), fc.json(), function (a, f, b) {
    let counter = 0;
    const thunk = Thunk.cached(function (x) {
      counter++;
      return {
        counter,
        output: f(x)
      };
    });
    const value = thunk(a);
    const other = thunk(b);
    Assert.eq('eq', value, other);
  }));
});
