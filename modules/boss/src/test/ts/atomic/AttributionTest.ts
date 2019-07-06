import { assert, UnitTest } from '@ephox/bedrock';
import { Gene } from 'ephox/boss/api/Gene';
import Attribution from 'ephox/boss/mutant/Attribution';

UnitTest.test('AttributionTest', function () {
  const item = Gene('id1', 'name1', [], {}, { border: '10' });
  const b = Gene('id2', 'name2', [], {}, { cat: 'dog' });

  assert.eq({ border: '10' }, item.attrs);
  Attribution.set(item, 'cat', 'mogel');
  assert.eq({ border: '10', cat: 'mogel' }, item.attrs);
  Attribution.remove(item, 'cat');
  assert.eq({ border: '10' }, item.attrs);
  assert.eq('10', Attribution.get(item, 'border'));

  Attribution.copyTo(item, b);
  assert.eq({
    cat: 'dog',
    border: '10'
  }, b.attrs);
});
