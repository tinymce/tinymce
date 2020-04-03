import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import * as Obj from 'ephox/katamari/api/Obj';
import fc from 'fast-check';
import { UnitTest, Assert } from '@ephox/bedrock-client';

UnitTest.test('ObjFindTest', function () {
  const checkNone = function (input, pred) {
    const actual = Obj.find(input, pred);
    return actual.isNone();
  };

  const checkObj = function (expected, input, pred) {
    const actual = Obj.find(input, pred).getOrDie('should have value');
    Assert.eq('eq', expected, actual);
  };

  checkNone({}, function (v, _k) { return v > 0; });
  checkObj(3, { test: 3 }, function (_v, k) { return k === 'test'; });
  checkNone({ test: 0 }, function (v, _k) { return v > 0; });
  checkObj(4, { blah: 4, test: 3 }, function (v, _k) { return v > 0; });
  checkNone({ blah: 4, test: 3 }, function (v, _k) { return v === 12; });

  const obj = { blah: 4, test: 3 };
  checkObj(4, obj, function (v, k, o) { return o === obj; });
});

UnitTest.test('the value found by find always passes predicate', () => {
  fc.assert(fc.property(
    fc.dictionary(fc.asciiString(), fc.json()),
    fc.func(fc.boolean()),
    function (obj, pred) {
      // It looks like the way that fc.fun works is it cares about all of its arguments, so therefore
      // we have to only pass in one if we want it to be deterministic. Just an assumption
      const value = Obj.find(obj, function (v) {
        return pred(v);
      });
      return value.fold(function () {
        const values = Obj.values(obj);
        return !Arr.exists(values, function (v) {
          return pred(v);
        });
      }, function (v) {
        return pred(v);
      });
    }
  ));
});

UnitTest.test('If predicate is always false, then find is always none', () => {
  fc.assert(fc.property(
    fc.dictionary(fc.asciiString(), fc.json()),
    function (obj) {
      const value = Obj.find(obj, Fun.constant(false));
      return value.isNone();
    }
  ));
});

UnitTest.test('If object is empty, find is always none', () => {
  fc.assert(fc.property(
    fc.func(fc.boolean()),
    function (pred) {
      const value = Obj.find({ }, pred);
      return value.isNone();
    }
  ));
});

UnitTest.test('If predicate is always true, then value is always the some(first), or none if dict is empty', () => {
  fc.assert(fc.property(
    fc.dictionary(fc.asciiString(), fc.json()),
    function (obj) {
      const value = Obj.find(obj, Fun.constant(true));
      // No order is specified, so we cannot know what "first" is
      return Obj.keys(obj).length === 0 ? value.isNone() : true;
    }
  ));
});
