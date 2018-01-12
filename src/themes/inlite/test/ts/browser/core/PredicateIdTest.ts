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
      { toolbar: 'a b c', predicate: isTrue, id: 'a' },
      { toolbar: 'd e', predicate: isFalse, id: 'b' }
    ]);

    assert.eq([
      PredicateId.create('a', isTrue),
      PredicateId.create('b', isFalse)
    ], predIds);
  };

  testFromContextToolbars();
});
