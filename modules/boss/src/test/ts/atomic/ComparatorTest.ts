import { Assert, UnitTest } from '@ephox/bedrock-client';

import { Gene } from 'ephox/boss/api/Gene';
import * as Comparator from 'ephox/boss/mutant/Comparator';

UnitTest.test('ComparatorTest', () => {
  const a = Gene('id1', 'bob', [], {}, { border: '10' });

  const b = Gene('id2', 'b name', [], {}, { cat: 'dog' });

  const c = Gene('id3', 'c', [], {}, {});

  // name
  Assert.eq('', true, Comparator.is(a, 'fred,bob,sam'));
  Assert.eq('', false, Comparator.is(a, 'fred,sam'));
  Assert.eq('', false, Comparator.is(a, 'border'));

  Assert.eq('', true, Comparator.is(b, 'b name'));
  Assert.eq('', false, Comparator.is(b, 'dog'));

  // attr
  Assert.eq('', true, Comparator.is(a, '[border]'));
  Assert.eq('', false, Comparator.is(a, '[foobar]'));

  Assert.eq('', true, Comparator.is(b, '[cat]'));
  Assert.eq('', false, Comparator.is(b, '[dog]'));
  Assert.eq('', false, Comparator.is(b, '[]'));

  Assert.eq('', false, Comparator.is(c, '[]'));
  Assert.eq('', false, Comparator.is(c, '[bob]'));
});
