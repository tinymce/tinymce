import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Obj from 'ephox/katamari/api/Obj';

describe('atomic.katamari.api.obj.ObjIsEmptyTest', () => {
  it('unit tests', () => {
    assert.isTrue(Obj.isEmpty({}));
    assert.isFalse(Obj.isEmpty({ cat: 'dog' }));
  });

  it('single key/value', () => {
    fc.assert(fc.property(
      fc.string(),
      fc.json(),
      (k: string, v: any) => {
        const o = { [k]: v };
        assert.isFalse(Obj.isEmpty(o));
      }
    ));
  });
});
