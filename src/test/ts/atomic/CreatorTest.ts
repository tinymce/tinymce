import Creator from 'ephox/boss/mutant/Creator';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('CreatorTest', function() {
  assert.eq({ id: 'clone**<c>', name: 'cat', children: [] }, Creator.clone({ id: 'c', name: 'cat', children: [ 'kittens' ] }));
});

