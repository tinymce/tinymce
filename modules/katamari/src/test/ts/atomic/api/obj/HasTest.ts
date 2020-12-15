import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Obj from 'ephox/katamari/api/Obj';

UnitTest.test('HasTest', () => {
  const withoutObjProto = Object.create(null);
  withoutObjProto.a = 1;

  Assert.eq('eq', true, Obj.has(withoutObjProto, 'a'));
  Assert.eq('eq', false, Obj.has(withoutObjProto, 'b'));

  Assert.eq('eq', true, Obj.has({ a: 1 }, 'a'));
  Assert.eq('eq', false, Obj.has({ a: 1 } as Record<string, number>, 'b'));
});
