import { Assert, UnitTest } from '@ephox/bedrock-client';
import { KAssert } from '@ephox/katamari-assertions';
import { Gene } from 'ephox/boss/api/Gene';
import * as Styling from 'ephox/boss/mutant/Styling';

UnitTest.test('StylingTest', () => {
  const item = Gene('item', 'item', [], { border: '10' });

  Assert.eq('eq', { border: '10' }, item.css);
  Styling.set(item, 'cat', 'mogel');
  Assert.eq('eq', { border: '10', cat: 'mogel' }, item.css);
  Styling.remove(item, 'cat');
  Assert.eq('eq', { border: '10' }, item.css);
  Assert.eq('eq', '10', Styling.get(item, 'border'));

  KAssert.eqNone('borderx should be none', Styling.getRaw(item, 'borderx'));
  KAssert.eqSome('Expected border style', '10', Styling.getRaw(item, 'border'));
});
