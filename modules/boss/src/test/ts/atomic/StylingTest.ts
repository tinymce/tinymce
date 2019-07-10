import Styling from 'ephox/boss/mutant/Styling';
import { UnitTest, assert } from '@ephox/bedrock';
import { Gene } from 'ephox/boss/api/Gene';

UnitTest.test('StylingTest', function () {
  const item = Gene('item', 'item', [], { border: '10' });

  assert.eq({ border: '10' }, item.css);
  Styling.set(item, 'cat', 'mogel');
  assert.eq({ border: '10', cat: 'mogel' }, item.css);
  Styling.remove(item, 'cat');
  assert.eq({ border: '10' }, item.css);
  assert.eq('10', Styling.get(item, 'border'));

  assert.eq(true, Styling.getRaw(item, 'borderx').isNone());
  assert.eq('10', Styling.getRaw(item, 'border').getOrDie('Expected border style'));
});
