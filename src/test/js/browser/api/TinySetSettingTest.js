asynctest(
  'TinySetSettingTest',

  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader'
  ],

  function (Pipeline, Assertions, Step, TinyApis, TinyLoader) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var sAssertSetting = function (editor, key, expected) {
      return Step.sync(function () {
        var actual = editor.settings[key]

        return Assertions.assertEq('should have expected val at key', expected, actual);
      });
    };

    var sAssertSettingType = function (editor, key, expected) {
      return Step.sync(function () {
        var actual = typeof editor.settings[key];

        return Assertions.assertEq('should have expected type', expected, actual);
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var apis = TinyApis(editor);

      Pipeline.async({}, [
        apis.sSetSetting('a', 'b'),
        sAssertSetting(editor, 'a', 'b'),
        apis.sSetSetting('a', function (a) { return a;}),
        sAssertSettingType(editor, 'a', 'function')
      ], onSuccess, onFailure);

    }, { }, success, failure);


  }
);