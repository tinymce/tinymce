import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import { Gene } from 'ephox/boss/api/Gene';
import * as Tracks from 'ephox/boss/mutant/Tracks';

UnitTest.test('TracksTest', () => {
  const family = Gene('A', '.', [
    Gene('B', '.'),
    Gene('C', '.', [
      Gene('D', '.', [
        Gene('E', '.')
      ]),
      Gene('F', '.')
    ])
  ]);

  const result = Tracks.track(family, Optional.some(Gene('parent', '.')));

  const a = result;
  const b = result.children[0];
  const c = result.children[1];
  const d = result.children[1].children[0];
  const e = result.children[1].children[0].children[0];
  const f = result.children[1].children[1];

  const p = (item: Gene) => {
    return item.parent.getOrDie('Expected to have parent').id;
  };

  Assert.eq('', 'A', a.id);
  Assert.eq('', 'B', b.id);
  Assert.eq('', 'C', c.id);
  Assert.eq('', 'D', d.id);
  Assert.eq('', 'E', e.id);
  Assert.eq('', 'F', f.id);

  Assert.eq('', 'parent', p(a));
  Assert.eq('', 'A', p(b));
  Assert.eq('', 'A', p(c));
  Assert.eq('', 'C', p(d));
  Assert.eq('', 'D', p(e));
  Assert.eq('', 'C', p(f));
});
