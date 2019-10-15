import { assert, UnitTest } from '@ephox/bedrock-client';
import { Gene } from 'ephox/boss/api/Gene';
import Comparator from 'ephox/boss/mutant/Comparator';

UnitTest.test('ComparatorTest', function () {
  const a = Gene('id1', 'bob', [], {}, { border: '10' });

  const b = Gene('id2', 'b name', [], {}, { cat: 'dog' });

  const c = Gene('id3', 'c', [], {}, {});

  // name
  assert.eq(true, Comparator.is(a, 'fred,bob,sam'));
  assert.eq(false, Comparator.is(a, 'fred,sam'));
  assert.eq(false, Comparator.is(a, 'border'));

  assert.eq(true, Comparator.is(b, 'b name'));
  assert.eq(false, Comparator.is(b, 'dog'));

  // attr
  assert.eq(true, Comparator.is(a, '[border]'));
  assert.eq(false, Comparator.is(a, '[foobar]'));

  assert.eq(true, Comparator.is(b, '[cat]'));
  assert.eq(false, Comparator.is(b, '[dog]'));
  assert.eq(false, Comparator.is(b, '[]'));

  assert.eq(false, Comparator.is(c, '[]'));
  assert.eq(false, Comparator.is(c, '[bob]'));
});
