import Attribution from 'ephox/boss/mutant/Attribution';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('AttributionTest', function() {
  var item = {
    attrs: {
      border: '10'
    }
  };

  var b = {
    attrs: {
      cat: 'dog'
    }
  }

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

