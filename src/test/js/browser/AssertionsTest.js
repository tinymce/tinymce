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
      boltAssert('[Equality]: test 1 (nothing defined).\n  Expected: 10\n  Actual: 5', err.message);
    }

    try {
      Assertions.assertEq('test 2 (nothing.defined)', 5, 5);
    } catch (err) {
      assert.fail('Unexpected error: ' + err.message);
    }

    window.assert.eq = boltAssert;
  }
);