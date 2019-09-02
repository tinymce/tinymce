import * as Obj from 'ephox/katamari/api/Obj';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ObjIsEmptyTest', function () {
  assert.eq(true, Obj.isEmpty({}));
  assert.eq(false, Obj.isEmpty({cat: 'dog'}));

  Jsc.property(
    'blargh',
    Jsc.string,
    Jsc.json,
    function (k: string, v: any) {
      const o = {[k]: v};
      return Jsc.eq(false, Obj.isEmpty(o));
    }
  );
});
