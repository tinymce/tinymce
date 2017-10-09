asynctest(
  'browser.tinymce.core.keyboard.SpaceKeyTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.TinyActions',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Keys, Logger, Pipeline, TinyActions, TinyApis, TinyLoader, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        Logger.t('Press space at beginning of inline boundary', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a <a href="#">b</a> c</p>'),
          tinyApis.sSetCursor([0, 1, 0], 0),
          tinyApis.sNodeChanged,
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1, 0], 1, [0, 1, 0], 1),
          tinyApis.sAssertContent('<p>a <a href="#">&nbsp;b</a> c</p>')
        ])),
        Logger.t('Press space at end of inline boundary', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a <a href="#">b</a> c</p>'),
          tinyApis.sSetCursor([0, 1, 0], 1),
          tinyApis.sNodeChanged,
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1, 0], 2, [0, 1, 0], 2),
          tinyApis.sAssertContent('<p>a <a href="#">b&nbsp;</a> c</p>')
        ]))
      ], onSuccess, onFailure);
    }, {
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);