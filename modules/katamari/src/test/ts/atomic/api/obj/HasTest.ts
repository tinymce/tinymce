import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Obj from 'ephox/katamari/api/Obj';

describe('atomic.katamari.api.obj.HasTest', () => {
  it('HasTest', () => {
    const withoutObjProto = Object.create(null);
    withoutObjProto.a = 1;

    assert.isTrue(Obj.has(withoutObjProto, 'a'));
    assert.isFalse(Obj.has(withoutObjProto, 'b'));

    assert.isTrue(Obj.has({ a: 1 }, 'a'));
    assert.isFalse(Obj.has({ a: 1 } as Record<string, number>, 'b'));
  });
});
