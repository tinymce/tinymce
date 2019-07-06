import { assert, UnitTest } from '@ephox/bedrock';
import { Gene } from 'ephox/boss/api/Gene';
import Creator from 'ephox/boss/mutant/Creator';

UnitTest.test('CreatorTest', function () {
  assert.eq(Gene('clone**<c>', 'cat', []), Creator.clone(Gene('c', 'cat', [Gene('kitten', 'kitten')])));
});
