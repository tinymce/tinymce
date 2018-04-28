import PredicateId from 'tinymce/themes/inlite/core/PredicateId';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('browser.core.PredicateIdTest', function () {
  const testFromContextToolbars = function () {
    const isTrue = function () {
      return true;
    };

    const isFalse = function () {
      return false;
    };

    const predIds = PredicateId.fromContextToolbars([
      { items: 'a b c', predicate: isTrue, id: 'a' },
      { items: 'd e', predicate: isFalse, id: 'b' }
    ]);

    assert.eq([
      PredicateId.create('a', isTrue),
      PredicateId.create('b', isFalse)
    ], predIds);
  };

  testFromContextToolbars();
});
