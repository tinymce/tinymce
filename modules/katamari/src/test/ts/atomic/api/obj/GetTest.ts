import * as Obj from 'ephox/katamari/api/Obj';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('GetTest', function () {
  assert.eq(1, Obj.get({ a: 1 }, 'a').getOrUndefined());
  assert.eq(false, Obj.get({ a: null }, 'a').isSome());
  assert.eq(false, Obj.get({ a: undefined }, 'a').isSome());
  assert.eq(undefined, Obj.get(<any> { a: 1 }, 'b').getOrUndefined());
});
