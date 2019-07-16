import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import * as Obj from 'ephox/katamari/api/Obj';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('BiFilterTest', function () {
  const even = function (x) {
    return x % 2 === 0;
  };

  const check = function (trueObj, falseObj, input, f) {
    const filtered = Obj.bifilter(input, f);
    assert.eq(trueObj, filtered.t);
    assert.eq(falseObj, filtered.f);
  };

  check({}, {a: '1'}, {a: '1'}, even);
  check({b: '2'}, {}, {b: '2'}, even);
  check({b: '2'}, {a: '1'}, {a: '1', b: '2'}, even);
  check({b: '2', d: '4'}, {a: '1', c: '3'}, {a: '1', b: '2', c: '3', d: '4'}, even);

  Jsc.property(
    'Check that if the filter always returns false, then everything is in "f"',
    Jsc.dict(Jsc.nestring),
    function (obj) {
      const output = Obj.bifilter(obj, Fun.constant(false));
      assert.eq(Obj.keys(obj).length, Obj.keys(output.f).length);
      assert.eq(0,  Obj.keys(output.t).length);
      return true;
    }
  );

  Jsc.property(
    'Check that if the filter always returns true, then everything is in "t"',
    Jsc.dict(Jsc.nestring),
    function (obj) {
      const output = Obj.bifilter(obj, Fun.constant(true));
      assert.eq(0, Obj.keys(output.f).length);
      assert.eq(Obj.keys(obj).length,  Obj.keys(output.t).length);
      return true;
    }
  );

  Jsc.property(
    'Check that everything in f fails predicate and everything in t passes predicate',
    Jsc.dict(Jsc.nestring),
    Jsc.fun(Jsc.bool),
    function (obj, predicate) {
      const output = Obj.bifilter(obj, predicate);

      const matches = function (k) {
        return predicate(obj[k]);
      };

      const falseKeys = Obj.keys(output.f);
      const trueKeys = Obj.keys(output.t);

      if (Arr.exists(falseKeys, matches)) {
        return 'Something in "f" passed predicate';
      }
      if (Arr.exists(trueKeys, Fun.not(matches))) {
        return 'Something in "t" failed predicate';
      }

      return true;
    }
  );
});
