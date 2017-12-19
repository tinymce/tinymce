import Thunk from 'ephox/katamari/api/Thunk';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ThunkTest', function() {
  var testSanity = function () {
    var args = null;
    var f = Thunk.cached(function () {
      args = Array.prototype.slice.call(arguments);
      return args;
    });
    var r1 = f('a');
    assert.eq(['a'], args);
    assert.eq(['a'], r1);
    var r2 = f('b');
    assert.eq(['a'], args);
    assert.eq(['a'], r2);
  };

  var testSpecs = function () {
    Jsc.property('Thunk.cached counter', Jsc.json, Jsc.fun(Jsc.json), Jsc.json, function (a, f, b) {
      var counter = 0;
      var thunk = Thunk.cached(function (x) {
        counter++;
        return {
          counter: counter,
          output: f(x)
        };
      });
      var value = thunk(a);
      var other = thunk(b);
      return Jsc.eq(value, other);
    });
  };

  testSanity();
  testSpecs();
});

