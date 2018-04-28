import Matcher from 'tinymce/themes/inlite/core/Matcher';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('browser.themes.inlite.MatcherTest', function () {
  const testMatch = function (mockEditor, matches, expectedResult) {
    let result;

    result = Matcher.match(mockEditor, matches);
    assert.eq(expectedResult, result);
  };

  const match = function (key) {
    return function (editor) {
      return editor[key];
    };
  };

  const testMatcher = function () {
    const mockEditor = {
      success1: 'success1',
      success2: 'success2',
      failure: null
    };

    testMatch(mockEditor, [
      match('success1')
    ], 'success1');

    testMatch(mockEditor, [
      match(null),
      match('success2')
    ], 'success2');

    testMatch(mockEditor, [
      match('success1'),
      match('success2')
    ], 'success1');

    testMatch(mockEditor, [
      match(null)
    ], null);

    testMatch(mockEditor, [
      match(null),
      match(null)
    ], null);

    testMatch(mockEditor, [], null);
  };

  testMatcher();
});
