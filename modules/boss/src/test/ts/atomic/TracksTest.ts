import Tracks from 'ephox/boss/mutant/Tracks';
import { Option } from '@ephox/katamari';
import { UnitTest, assert } from '@ephox/bedrock';
import { Gene } from '../../../main/ts/ephox/boss/api/Gene';

UnitTest.test('TracksTest', function() {
  const family = Gene('A', '.', [
    Gene('B', '.'),
    Gene('C', '.', [
      Gene('D', '.', [
        Gene('E', '.')
      ]),
      Gene('F', '.')
    ])
  ]);

  const result = Tracks.track(family, Option.some(Gene('parent', '.')));

  const a = result;
  const b = result.children[0];
  const c = result.children[1];
  const d = result.children[1].children[0];
  const e = result.children[1].children[0].children[0];
  const f = result.children[1].children[1];

  const p = function (item: Gene) {
    return item.parent.getOrDie('Expected to have parent').id;
  };

  assert.eq('A', a.id);
  assert.eq('B', b.id);
  assert.eq('C', c.id);
  assert.eq('D', d.id);
  assert.eq('E', e.id);
  assert.eq('F', f.id);

  assert.eq('parent', p(a));
  assert.eq('A', p(b));
  assert.eq('A', p(c));
  assert.eq('C', p(d));
  assert.eq('D', p(e));
  assert.eq('C', p(f));
});

