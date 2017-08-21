asynctest(
  'browser.tinymce.core.keyboard.EnterKeyHrTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyActions',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Keys, Logger, Pipeline, Step, TinyActions, TinyApis, TinyLoader, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,

        Logger.t('Enter before HR in the beginning of content', GeneralSteps.sequence([
          tinyApis.sSetContent('<hr /><p>a</p>'),
          tinyApis.sSetCursor([], 0),
          tinyActions.sContentKeystroke(Keys.enter(), {}),
          tinyApis.sAssertContent('<p>&nbsp;</p><hr /><p>a</p>'),
          tinyApis.sAssertSelection([0], 0, [0], 0)
        ])),

        Logger.t('Enter after HR in the beginning of content', GeneralSteps.sequence([
          tinyApis.sSetContent('<hr /><p>a</p>'),
          tinyApis.sSetCursor([], 1),
          tinyActions.sContentKeystroke(Keys.enter(), {}),
          tinyApis.sAssertContent('<hr /><p>&nbsp;</p><p>a</p>'),
          tinyApis.sAssertSelection([2, 0], 0, [2, 0], 0)
        ])),

        Logger.t('Enter before HR in the middle of content', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><hr /><p>b</p>'),
          tinyApis.sSetCursor([], 1),
          tinyActions.sContentKeystroke(Keys.enter(), {}),
          tinyApis.sAssertContent('<p>a</p><p>&nbsp;</p><hr /><p>b</p>'),
          tinyApis.sAssertSelection([1], 0, [1], 0)
        ])),

        Logger.t('Enter after HR in the middle of content', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><hr /><p>b</p>'),
          tinyApis.sSetCursor([], 2),
          tinyActions.sContentKeystroke(Keys.enter(), {}),
          tinyApis.sAssertContent('<p>a</p><hr /><p>&nbsp;</p><p>b</p>'),
          tinyApis.sAssertSelection([3, 0], 0, [3, 0], 0)
        ])),

        Logger.t('Enter before HR in the end of content', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a</p><hr />'),
          tinyApis.sSetCursor([], 1),
          tinyActions.sContentKeystroke(Keys.enter(), {}),
          tinyApis.sAssertContent('<p>a</p><p>&nbsp;</p><hr />'),
          tinyApis.sAssertSelection([1], 0, [1], 0)
        ])),

        Logger.t('Enter after HR in the end of content', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a</p><hr />'),
          tinyApis.sSetCursor([], 2),
          tinyActions.sContentKeystroke(Keys.enter(), {}),
          tinyApis.sAssertContent('<p>a</p><hr /><p>&nbsp;</p>'),
          tinyApis.sAssertSelection([2], 0, [2], 0)
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: '',
      toolbar: '',
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);