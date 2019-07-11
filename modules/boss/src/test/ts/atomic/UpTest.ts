import { assert, UnitTest } from '@ephox/bedrock';
import { Arr, Option } from '@ephox/katamari';
import { Gene } from 'ephox/boss/api/Gene';
import Locator from 'ephox/boss/mutant/Locator';
import Tracks from 'ephox/boss/mutant/Tracks';
import Up from 'ephox/boss/mutant/Up';

UnitTest.test('UpTest', function () {
  const family = Tracks.track(
    Gene('A', '_A_', [
      Gene('B', '_B_'),
      Gene('C', '_C_', [
        Gene('D', '_D_', [
          Gene('E', '_E_')
        ]),
        Gene('F', '_F_')
      ])
    ]), Option.none());

  const d = Locator.byId(family, 'D').getOrDie();
  assert.eq('A', Up.selector(d, '_A_').getOrDie().id);
  assert.eq('A', Up.closest(d, '_A_').getOrDie().id);
  assert.eq('C', Up.selector(d, '_C_').getOrDie().id);
  assert.eq('C', Up.closest(d, '_C_').getOrDie().id);
  assert.eq(true, Up.selector(d, '_D_').isNone());
  assert.eq('D', Up.closest(d, '_D_').getOrDie().id);
  assert.eq('D', Up.closest(d, '_A_,_D_').getOrDie().id);
  assert.eq('D', Up.closest(d, '_A_,_D_,_B_').getOrDie().id);
  assert.eq('C', Up.selector(d, '_C_,_A_').getOrDie().id);
  assert.eq('C', Up.closest(d, '_C_,_A_').getOrDie().id);
  assert.eq('C', Up.selector(d, '_B_,_C_,_A_').getOrDie().id);
  assert.eq('C', Up.closest(d, '_B_,_C_,_A_').getOrDie().id);
  assert.eq('C', Up.selector(d, '_B_,_A_,_C_').getOrDie().id);
  assert.eq('C', Up.closest(d, '_B_,_A_,_C_').getOrDie().id);
  assert.eq(true, Up.selector(d, '_B_,_Z_').isNone());
  assert.eq(true, Up.closest(d, '_B_,_Z_').isNone());

  assert.eq('A', Up.predicate(d, function (item: Gene) {
    return item.id === 'A';
  }).getOrDie().id);

  assert.eq(true, Up.predicate(d, function (item: Gene) {
    return item.id === 'root';
  }).isNone());

  const checkAll = function (expected: string, start: string) {
    const item = Locator.byId(family, start).getOrDie();
    const result = Up.all(item);
    assert.eq(expected, Arr.map(result, function (r) {
      return r.id;
    }).join(','));
  };

  checkAll('D,C,A', 'E');
  checkAll('C,A', 'F');
  checkAll('', 'A');
  checkAll('A', 'B');

  assert.eq('A', Up.top(d).id);
});
