asynctest(
  'atomic.tinymce.core.text.ExtendingCharTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.text.ExtendingChar'
  ],
  function (LegacyUnit, Pipeline, ExtendingChar) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    suite.test('isExtendingChar', function () {
      LegacyUnit.strictEqual(ExtendingChar.isExtendingChar('a'), false);
      LegacyUnit.strictEqual(ExtendingChar.isExtendingChar('\u0301'), true);
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);
