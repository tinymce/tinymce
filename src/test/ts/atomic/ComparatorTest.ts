import Comparator from 'ephox/boss/mutant/Comparator';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ComparatorTest', function() {
  var item = {
    name: 'bob',
    attrs: {
      border: '10'
    }
  };

  var b = {
    name: 'b name',
    attrs: {
      cat: 'dog'
    }
  };

  var c = {
    name: 'c',
    attrs: {}
  };

  // name
  assert.eq(true,  Comparator.is(item, 'fred,bob,sam'));
  assert.eq(false, Comparator.is(item, 'fred,sam'));
  assert.eq(false, Comparator.is(item, 'border'));

  assert.eq(true,  Comparator.is(b, 'b name'));
  assert.eq(false, Comparator.is(b, 'dog'));

  // attr
  assert.eq(true,  Comparator.is(item, '[border]'));
  assert.eq(false, Comparator.is(item, '[foobar]'));

  assert.eq(true,  Comparator.is(b, '[cat]'));
  assert.eq(false, Comparator.is(b, '[dog]'));
  assert.eq(false, Comparator.is(b, '[]'));

  assert.eq(false, Comparator.is(c, '[]'));
  assert.eq(false, Comparator.is(c, '[bob]'));
});

