asynctest(
  'browser.tinymce.core.util.FunTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.util.Fun'
  ],
  function (LegacyUnit, Pipeline, Fun) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    var isTrue = function (value) {
      return value === true;
    };

    var isFalse = function (value) {
      return value === true;
    };

    var isAbove = function (target, value) {
      return value() > target();
    };

    suite.test('constant', function () {
      LegacyUnit.strictEqual(Fun.constant(1)(), 1);
      LegacyUnit.strictEqual(Fun.constant("1")(), "1");
      LegacyUnit.strictEqual(Fun.constant(null)(), null);
    });

    suite.test('negate', function () {
      LegacyUnit.strictEqual(Fun.negate(isTrue)(false), true);
      LegacyUnit.strictEqual(Fun.negate(isFalse)(true), false);
    });

    suite.test('and', function () {
      var isAbove5 = Fun.curry(isAbove, Fun.constant(5));
      var isAbove10 = Fun.curry(isAbove, Fun.constant(10));

      LegacyUnit.strictEqual(Fun.and(isAbove10, isAbove5)(Fun.constant(10)), false);
      LegacyUnit.strictEqual(Fun.and(isAbove10, isAbove5)(Fun.constant(30)), true);
    });

    suite.test('or', function () {
      var isAbove5 = Fun.curry(isAbove, Fun.constant(5));
      var isAbove10 = Fun.curry(isAbove, Fun.constant(10));

      LegacyUnit.strictEqual(Fun.or(isAbove10, isAbove5)(Fun.constant(5)), false);
      LegacyUnit.strictEqual(Fun.or(isAbove10, isAbove5)(Fun.constant(15)), true);
      LegacyUnit.strictEqual(Fun.or(isAbove5, isAbove10)(Fun.constant(15)), true);
    });

    suite.test('compose', function () {
      LegacyUnit.strictEqual(Fun.compose(Fun.curry(isAbove, Fun.constant(5)), Fun.constant)(10), true);
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);
