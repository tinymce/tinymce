import * as Id from 'ephox/katamari/api/Id';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Id: Unit Tests', () => {
  const one = Id.generate('test');
  const two = Id.generate('test');
  Assert.eq('id has prefix #1', 0, one.indexOf('test'));
  Assert.eq('id has prefix #1', 0, two.indexOf('test'));
  Assert.eq('subsequent ids are inequal', false, one === two);
});

UnitTest.test('Id: Two ids should not be the same', () => {
  const arbId = fc.string(1, 30).map(Id.generate);
  fc.assert(fc.property(arbId, arbId, (id1, id2) => id1 !== id2));
});
