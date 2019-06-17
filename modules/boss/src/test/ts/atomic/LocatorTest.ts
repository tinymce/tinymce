import { assert, UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';
import { Gene } from 'ephox/boss/api/Gene';
import Creator from 'ephox/boss/mutant/Creator';
import Locator from 'ephox/boss/mutant/Locator';
import Tracks from 'ephox/boss/mutant/Tracks';

UnitTest.test('LocatorTest', function() {
  const family = Tracks.track(
    Gene('A', '.', [
      Gene('B', '.'),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.')
        ]),
        Gene('F', '.'),
        Creator.text('cattle')
      ])
    ]), Option.none());

  assert.eq('D', Locator.byId(family, 'D').getOrDie().id);
  assert.eq('A', Locator.byId(family, 'A').getOrDie().id);
  assert.eq(true, Locator.byItem(family, Gene('?_cattle', '.')).isNone());
  assert.eq(false, Locator.byItem(family, Locator.byId(family, '?_cattle').getOrDie()).isNone());
  assert.eq(true, Locator.byId(family, 'Z').isNone());
});

