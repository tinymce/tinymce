import * as Id from 'ephox/katamari/api/Id';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, Assert } from '@ephox/bedrock';

UnitTest.test('IdTest', function () {
  const one = Id.generate('test');
  const two = Id.generate('test');
  Assert.eq('id has prefix #1', 0, one.indexOf('test'));
  Assert.eq('id has prefix #1', 0, two.indexOf('test'));
  Assert.eq('subsequent ids are inequal', false, one === two);

  const arbId = Jsc.nestring.smap(function (s) {
    return Id.generate(s);
  }, function (id) {
    return id.substring(0, id.indexOf('_'));
  });

  Jsc.property('Two ids should not be the same', arbId, arbId, function (id1, id2) {
    return !Jsc.eq(id1, id2) ? true : 'Ids should not be the same: ' + id1;
  });
});
