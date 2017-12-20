import Creator from 'ephox/boss/mutant/Creator';
import Locator from 'ephox/boss/mutant/Locator';
import Tracks from 'ephox/boss/mutant/Tracks';
import { Option } from '@ephox/katamari';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('LocatorTest', function() {
  var family = Tracks.track({
    id: 'A',
    children: [
      { id: 'B', children: [ ] },
      { id: 'C', children: [
        { id: 'D', children: [
          { id: 'E', children: [] }
        ]},
        { id: 'F', children: [] },
        Creator.text('cattle')
      ]}
    ]
  }, Option.none());

  assert.eq('D', Locator.byId(family, 'D').getOrDie().id);
  assert.eq('A', Locator.byId(family, 'A').getOrDie().id);
  assert.eq(true, Locator.byItem(family, { id: '?_cattle' }).isNone());
  assert.eq(false, Locator.byItem(family, Locator.byId(family, '?_cattle').getOrDie()).isNone());
  assert.eq(true, Locator.byId(family, 'Z').isNone());
});

