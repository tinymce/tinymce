import { Assert, UnitTest } from '@ephox/bedrock-client';

import { Gene } from 'ephox/boss/api/Gene';
import * as Attribution from 'ephox/boss/mutant/Attribution';

UnitTest.test('AttributionTest', () => {
  const item = Gene('id1', 'name1', [], {}, { border: '10' });
  const b = Gene('id2', 'name2', [], {}, { cat: 'dog' });

  Assert.eq('', { border: '10' }, item.attrs);
  Attribution.set(item, 'cat', 'mogel');
  Assert.eq('', { border: '10', cat: 'mogel' }, item.attrs);
  Attribution.remove(item, 'cat');
  Assert.eq('', { border: '10' }, item.attrs);
  Assert.eq('', '10', Attribution.get(item, 'border'));

  Attribution.copyTo(item, b);
  Assert.eq('', {
    cat: 'dog',
    border: '10'
  }, b.attrs);
});
