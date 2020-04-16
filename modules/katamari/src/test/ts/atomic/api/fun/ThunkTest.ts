import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Thunk from 'ephox/katamari/api/Thunk';
import fc from 'fast-check';

UnitTest.test('ThunkTest', () => {
  let callArgs: any[] | null = null;
  const f = Thunk.cached((...args: any[]) => {
    callArgs = args;
    return args;
  });
  const r1 = f('a');
  Assert.eq('eq', [ 'a' ], callArgs);
  Assert.eq('eq', [ 'a' ], r1);
  const r2 = f('b');
  Assert.eq('eq', [ 'a' ], callArgs);
  Assert.eq('eq', [ 'a' ], r2);
});

UnitTest.test('Thunk.cached counter', () => {
  fc.assert(fc.property(fc.json(), fc.func(fc.json()), fc.json(), (a, f, b) => {
    let counter = 0;
    const thunk = Thunk.cached((x) => {
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
