asynctest(
  'TinySetAndDeleteSettingTest',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader'
  ],

  function (Assertions, GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var sAssertSetting = function (editor, key, expected) {
      return Step.sync(function () {
        var actual = editor.settings[key];

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
        Logger.t('set and change setting', GeneralSteps.sequence([
          apis.sSetSetting('a', 'b'),
          sAssertSetting(editor, 'a', 'b'),
          apis.sSetSetting('a', 'c'),
          sAssertSetting(editor, 'a', 'c')
        ])),

        Logger.t('set setting to function', GeneralSteps.sequence([
          apis.sSetSetting('a', function (a) {
            return a;
          }),
          sAssertSettingType(editor, 'a', 'function')
        ])),

        Logger.t('delete setting', GeneralSteps.sequence([
          apis.sDeleteSetting('a'),
          sAssertSetting(editor, 'a', undefined)
        ]))

      ], onSuccess, onFailure);

    }, { }, success, failure);


  }
);