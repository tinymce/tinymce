import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import * as Obj from 'ephox/katamari/api/Obj';

describe('atomic.katamari.api.arr.ObjFilterTest', () => {
  it('filter const true is identity', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), (obj) => {
      assert.deepEqual(Obj.filter(obj, Fun.always), obj);
    }));
  });

  it('filter of {} = {}', () => {
    assert.deepEqual(Obj.filter({}, Fun.die('should not be called')), {});
  });

  it('unit tests', () => {
    assert.deepEqual(Obj.filter({ a: 1, b: 2 }, (x) => x === 1), { a: 1 });
    assert.deepEqual(Obj.filter({ a: 1, b: 2 }, (x) => x === 2), { b: 2 });
    assert.deepEqual(Obj.filter({ c: 5, a: 1, b: 2 }, (x) => x >= 2), { b: 2, c: 5 });
    assert.deepEqual(Obj.filter({ c: 5, a: 1, b: 2 }, (x, i) => i === 'c'), { c: 5 });
  });
});
