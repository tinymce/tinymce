import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Obj from 'ephox/katamari/api/Obj';

const makePossiblyEmptyValue = (isEmpty: boolean): { hasKey: boolean } | {} => isEmpty ? {} : { hasKey: true };

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

  it('helps TypeScript understand the non-empty type', () => {
    const maybeEmpty = makePossiblyEmptyValue(false);
    if (!Obj.isEmpty(maybeEmpty)) {
      const emptyType: { hasKey: boolean } = maybeEmpty;
      assert.isTrue(emptyType.hasKey);
    } else {
      assert.fail('Expected non-empty object');
    }
  });

  /* The compiler won't complain about this case even if the value is non-empty, but just for completeness */
  it('helps TypeScript understand the empty type', () => {
    const maybeEmpty = makePossiblyEmptyValue(true);
    if (Obj.isEmpty(maybeEmpty)) {
      const emptyType: {} = maybeEmpty;
      assert.deepStrictEqual(emptyType, {});
    } else {
      assert.fail('Expected empty object');
    }
  });
});
