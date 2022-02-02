import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Thunk from 'ephox/katamari/api/Thunk';

describe('atomic.katamari.api.fun.ThunkTest', () => {

  it('ThunkTest', () => {
    let callArgs: any[] | null = null;
    const f = Thunk.cached((...args: any[]) => {
      callArgs = args;
      return args;
    });
    const r1 = f('a');
    assert.deepEqual(callArgs, [ 'a' ]);
    assert.deepEqual(r1, [ 'a' ]);
    const r2 = f('b');
    assert.deepEqual(callArgs, [ 'a' ]);
    assert.deepEqual(r2, [ 'a' ]);
  });

  it('Thunk.cached counter', () => {
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
      assert.deepEqual(other, value);
    }));
  });
});
