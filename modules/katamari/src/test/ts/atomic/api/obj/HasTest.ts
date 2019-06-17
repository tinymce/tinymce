import * as Obj from 'ephox/katamari/api/Obj';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('HasTest', function() {
  const withoutObjProto = Object.create(null);
  withoutObjProto.a = 1;

  assert.eq(true, Obj.has(withoutObjProto, 'a'));
  assert.eq(false, Obj.has(withoutObjProto, 'b'));

  assert.eq(true, Obj.has({ a: 1 }, 'a'));
  assert.eq(false, Obj.has(<any> { a: 1 }, 'b'));
});