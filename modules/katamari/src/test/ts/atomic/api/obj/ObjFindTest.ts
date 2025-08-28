import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import * as Obj from 'ephox/katamari/api/Obj';

describe('atomic.katamari.api.obj.ObjFindTest', () => {
  it('ObjFindTest', () => {
    const checkNone = <T>(input: Record<string, T>, pred: (val: T, key: string, obj: Record<string, T>) => boolean) => {
      const actual = Obj.find(input, pred);
      assert.isTrue(actual.isNone());
    };

    const checkObj = <T>(expected: T, input: Record<string, T>, pred: (val: T, key: string, obj: Record<string, T>) => boolean) => {
      const actual = Obj.find(input, pred).getOrDie('should have value');
      assert.deepEqual(actual, expected);
    };

    checkNone<number>({}, (v, _k) => {
      return v > 0;
    });
    checkObj(3, { test: 3 }, (_v, k) => {
      return k === 'test';
    });
    checkNone({ test: 0 }, (v, _k) => {
      return v > 0;
    });
    checkObj(4, { blah: 4, test: 3 }, (v, _k) => {
      return v > 0;
    });
    checkNone({ blah: 4, test: 3 }, (v, _k) => {
      return v === 12;
    });

    const obj = { blah: 4, test: 3 };
    checkObj(4, obj, (v, k, o) => {
      return o === obj;
    });
  });

  it('the value found by find always passes predicate', () => {
    fc.assert(fc.property(
      fc.dictionary(fc.asciiString(), fc.json()),
      fc.func(fc.boolean()),
      (obj, pred) => {
        // It looks like the way that fc.fun works is it cares about all of its arguments, so therefore
        // we have to only pass in one if we want it to be deterministic. Just an assumption
        const value = Obj.find(obj, (v) => {
          return pred(v);
        });
        return value.fold(() => {
          const values = Obj.values(obj);
          return !Arr.exists(values, (v) => {
            return pred(v);
          });
        }, (v) => {
          return pred(v);
        });
      }
    ));
  });

  it('If predicate is always false, then find is always none', () => {
    fc.assert(fc.property(
      fc.dictionary(fc.asciiString(), fc.json()),
      (obj) => {
        const value = Obj.find(obj, Fun.never);
        return value.isNone();
      }
    ));
  });

  it('If object is empty, find is always none', () => {
    fc.assert(fc.property(
      fc.func(fc.boolean()),
      (pred) => {
        const value = Obj.find({}, pred);
        return value.isNone();
      }
    ));
  });

  it('If predicate is always true, then value is always the some(first), or none if dict is empty', () => {
    fc.assert(fc.property(
      fc.dictionary(fc.asciiString(), fc.json()),
      (obj) => {
        const value = Obj.find(obj, Fun.always);
        // No order is specified, so we cannot know what "first" is
        return Obj.keys(obj).length === 0 ? value.isNone() : true;
      }
    ));
  });
});
