asynctest(
  'browser.tinymce.core.fmt.RemoveTrailingWhitespaceFormatTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.plugins.link.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, TinyUi, LinkPlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    LinkPlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        Logger.t('remove bold with leading whitespace', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><strong>a b</strong></p>'),
          tinyApis.sSetSelection([0, 0, 0], 1, [0, 0, 0], 3),
          tinyUi.sClickOnToolbar('toggle off bold', 'div[aria-label="Bold"] button'),
          tinyApis.sAssertContent('<p><strong>a</strong> b</p>')
        ])),
        Logger.t('remove bold with trailing whitespace', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><strong>a b</strong></p>'),
          tinyApis.sSetSelection([0, 0, 0], 0, [0, 0, 0], 2),
          tinyUi.sClickOnToolbar('toggle off bold', 'div[aria-label="Bold"] button'),
          tinyApis.sAssertContent('<p>a <strong>b</strong></p>')
        ])),
        Logger.t('unlink with leading whitespace', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><a href="#">a b</a></p>'),
          tinyApis.sSetSelection([0, 0, 0], 1, [0, 0, 0], 3),
          tinyUi.sClickOnToolbar('click unlink', 'div[aria-label="Remove link"]'),
          tinyApis.sAssertContent('<p><a href="#">a</a> b</p>')
        ])),
        Logger.t('unlink with trailing whitespace', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><a href="#">a b</a></p>'),
          tinyApis.sSetSelection([0, 0, 0], 0, [0, 0, 0], 2),
          tinyUi.sClickOnToolbar('click unlink', 'div[aria-label="Remove link"]'),
          tinyApis.sAssertContent('<p>a <a href="#">b</a></p>')
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'link',
      toolbar: 'bold unlink',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);