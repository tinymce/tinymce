import { assert, UnitTest } from '@ephox/bedrock';
import * as Assertions from 'ephox/agar/api/Assertions';

UnitTest.test('AssertionsTest', function () {
  const replaceTokens = function (str, values) {
    return str.replace(/\{\{(\w+)\}\}/gi, function ($0, $1) {
      return values[$1] ? values[$1] : '';
    });
  };

  try {
    Assertions.assertEq('test 2 (assertEq)', 5, 5);
  } catch (err) {
    assert.fail('Unexpected error: ' + err.message);
  }

  try {
    Assertions.assertEq('test 1 (assert.eq)', 10, 5);
  } catch (err) {
    assert.eq('test 1 (assert.eq).\n  Expected: 10\n  Actual: 5', err.message);
  }

  try {
    Assertions.assertEq('test 2 (assert.eq)', 5, 5);
  } catch (err) {
    assert.fail('Unexpected error: ' + err.message);
  }

  try {
    const v1 = {
      style: 'display: block; float: left;',
      class: 'class1 class2'
    };

    const v2 = {
      style: 'float: left; display: block;',
      class: 'class2 class1'
    };

    const html = '<div id="container" style="{{style}}"><p class="{{class}}">some text</p></div>';

    Assertions.assertHtmlStructure('html is the same, although styles & classes are in different order', replaceTokens(html, v1), replaceTokens(html, v2));
  } catch (err) {
    assert.fail('Unexpected error: ' + err.message);
  }
});
