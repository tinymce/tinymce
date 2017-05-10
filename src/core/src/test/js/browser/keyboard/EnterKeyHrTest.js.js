asynctest(
  'Browser Test: .keyboard.EnterKeyHrTest.js',
  [
    'ephox.agar.api.Keys',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyActions',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.themes.modern.Theme'
  ],
  function (Keys, Pipeline, Step, TinyActions, TinyApis, TinyLoader, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        tinyApis.sSetContent('<hr /><p>a</p>'),
        tinyApis.sSetCursor([], 0),
        tinyActions.sContentKeystroke(Keys.enter(), {}),
        tinyApis.sAssertContent('<hr /><p>&nbsp;</p><p>a</p>'),
        Step.wait(6000000)

      ], onSuccess, onFailure);
    }, {
      plugins: '',
      toolbar: '',
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);