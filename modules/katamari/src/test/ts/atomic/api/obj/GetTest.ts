import { describe, it } from '@ephox/bedrock-client';

import * as Obj from 'ephox/katamari/api/Obj';
import { assertNone, assertSome } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.obj.GetTest', () => {

  it('gets existing values', () => {
    assertSome(Obj.get({ a: 3 }, 'a'), 3);
  });

  it('returns none for non-existing keys', () => {
    assertNone(Obj.get({ a: null }, 'a'));
    assertNone(Obj.get({ a: undefined }, 'a'));
    assertNone(Obj.get({ a: 1 } as Record<string, number>, 'b'));
  });
});
