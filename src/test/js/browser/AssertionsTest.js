test(
  'AssertionsTest',

  [
    'ephox.agar.api.Assertions',
    'global!window'
  ],

  function (Assertions, window) {
    window.assertEq = function (a, b, message) {
      if (a !== b) throw new Error('window.assert.eq error: ' + message);
    };


    var replaceTokens = function (str, values) {
      return str.replace(/\{\{(\w+)\}\}/gi, function ($0, $1) {
        return values[$1] ? values[$1] : '';
      });
    };


    try {
      Assertions.assertEq('test 1 (assertEq)', 10, 5);
    } catch (err) {
      assert.eq('window.assert.eq error: test 1 (assertEq).\n  Expected: 10\n  Actual: 5', err.message);
    }

    try {
      Assertions.assertEq('test 2 (assertEq)', 5, 5);
    } catch (err) {
      assert.fail('Unexpected error: ' + err.message);
    }

    delete window['assertEq'];

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

    var boltAssert = window.assert.eq;
    delete window.assert['eq'];

    try {
      Assertions.assertEq('test 1 (nothing defined)', 10, 5);
    } catch (err) {
      boltAssert('test 1 (nothing defined).\n  Expected: 10\n  Actual: 5', err.message);
    }

    try {
      Assertions.assertEq('test 2 (nothing.defined)', 5, 5);
    } catch (err) {
      assert.fail('Unexpected error: ' + err.message);
    }

    window.assert.eq = boltAssert;

    try {
      var v1 = {
        'style': 'display: block; float: left;',
        'class': 'class1 class2'
      };

      var v2 = {
        'style': 'float: left; display: block;',
        'class': 'class2 class1'
      };

      var html = '<div id="container" style="{{style}}"><p class="{{class}}">some text</p></div>';

      Assertions.assertHtmlStructure('html is the same, although styles & classes are in different order', replaceTokens(html, v1), replaceTokens(html, v2));
    } catch (err) {
      assert.fail('Unexpected error: ' + err.message);
    }
  }
);