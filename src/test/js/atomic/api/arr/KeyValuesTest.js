import Arr from 'ephox/katamari/api/Arr';
import Obj from 'ephox/katamari/api/Obj';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('KeyValuesTest', function() {
  var check = function(expKeys, expValues, input) {
    var c = function(expected, v) {
      v.sort();
      assert.eq(expected, v);
    };

    c(expKeys, Obj.keys(input));
    c(expValues, Obj.values(input));
  };

  check([], [], {});
  check(['a'], ['A'], {a: 'A'});
  check(['a', 'b', 'c'], ['A', 'B', 'C'], {a: 'A', c: 'C', b: 'B'});

  Jsc.property(
    'Obj.keys(input) are all in input and hasOwnProperty',
    Jsc.dict(Jsc.json),
    function (obj) {
      var keys = Obj.keys(obj);
      return Arr.forall(keys, function (k) {
        return obj.hasOwnProperty(k);
      });
    }
  );
});

