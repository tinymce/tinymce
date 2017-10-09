asynctest(
  'browser.tinymce.core.InsertContentTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Logger, Pipeline, TinyApis, TinyLoader, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('Insert contents on a triple click selection should not produce odd spans', GeneralSteps.sequence([
          tinyApis.sSetContent('<blockquote><p>a</p></blockquote><p>b</p>'),
          tinyApis.sSetSelection([0, 0, 0], 0, [1], 0),
          tinyApis.sExecCommand('mceInsertContent', '<p>c</p>'),
          tinyApis.sAssertContent('<blockquote><p>c</p></blockquote><p>b</p>'),
          tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1)
        ]))
      ], onSuccess, onFailure);
    }, {
      selector: 'textarea',
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      content_style: 'blockquote { font-size: 12px }' // Needed to produce spans with runtime styles
    }, success, failure);
  }
);
