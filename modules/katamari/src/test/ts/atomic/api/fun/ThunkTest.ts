import * as Thunk from 'ephox/katamari/api/Thunk';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ThunkTest', function() {
  const testSanity = function () {
    let args = null;
    const f = Thunk.cached(function () {
      args = Array.prototype.slice.call(arguments);
      return args;
    });
    const r1 = f('a');
    assert.eq(['a'], args);
    assert.eq(['a'], r1);
    const r2 = f('b');
    assert.eq(['a'], args);
    assert.eq(['a'], r2);
  };

  const testSpecs = function () {
    Jsc.property('Thunk.cached counter', Jsc.json, Jsc.fun(Jsc.json), Jsc.json, function (a, f, b) {
      let counter = 0;
      const thunk = Thunk.cached(function (x) {
        counter++;
        return {
          counter: counter,
          output: f(x)
        };
      });
      const value = thunk(a);
      const other = thunk(b);
      return Jsc.eq(value, other);
    });
  };

  testSanity();
  testSpecs();
});

