asynctest(
  'browser.tinymce.core.util.ToolsTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.util.Tools'
  ],
  function (LegacyUnit, Pipeline, Tools) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    suite.test('extend', function () {
      LegacyUnit.deepEqual({ a: 1, b: 2, c: 3 }, Tools.extend({ a: 1 }, { b: 2 }, { c: 3 }));
      LegacyUnit.deepEqual({ a: 1, c: 3 }, Tools.extend({ a: 1 }, null, { c: 3 }));
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);
