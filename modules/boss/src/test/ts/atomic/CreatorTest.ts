import { Assert, UnitTest } from '@ephox/bedrock-client';

import { Gene } from 'ephox/boss/api/Gene';
import * as Creator from 'ephox/boss/mutant/Creator';

UnitTest.test('CreatorTest', () => {
  Assert.eq('', Gene('clone**<c>', 'cat', []), Creator.clone(Gene('c', 'cat', [ Gene('kitten', 'kitten') ])));
});
