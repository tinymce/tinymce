import Tracks from 'ephox/boss/mutant/Tracks';
import { Option } from '@ephox/katamari';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('TracksTest', function() {
  var family = {
    id: 'A',
    children: [
      { id: 'B', children: [ ] },
      { id: 'C', children: [
        { id: 'D', children: [
          { id: 'E', children: [] }
        ]},
        { id: 'F', children: [] }
      ]}
    ]
  };

  var result = Tracks.track(family, Option.some({ id: 'parent' }));

  assert.eq(true, result.parent.exists(function (x) { return x.id === 'parent'; }));
  var a = result;
  var b = result.children[0];
  var c = result.children[1];
  var d = result.children[1].children[0];
  var e = result.children[1].children[0].children[0];
  var f = result.children[1].children[1];

  var p = function (item) {
    return item.parent.getOrDie().id;
  };

  assert.eq('A', a.id);
  assert.eq('B', b.id);
  assert.eq('C', c.id);
  assert.eq('D', d.id);
  assert.eq('E', e.id);
  assert.eq('F', f.id);

  assert.eq('A', p(b));
  assert.eq('A', p(c));
  assert.eq('C', p(d));
  assert.eq('D', p(e));
  assert.eq('C', p(f));
});

