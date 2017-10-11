asynctest(
  'browser.tinymce.plugins.preview.PreviewContentStyleTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.plugins.preview.Plugin',
    'tinymce.plugins.preview.ui.IframeContent',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, RawAssertions, Step, TinyApis, TinyLoader, PreviewPlugin, IframeContent, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    PreviewPlugin();

    var assertIframeContains = function (editor, text, expected) {
      var actual = IframeContent.getPreviewHtml(editor);
      var regexp = new RegExp(text);

      RawAssertions.assertEq('Should be same html', expected, regexp.test(actual));
    };

    var sAssertIframeHtmlContains = function (editor, text) {
      return Step.sync(function () {
        assertIframeContains(editor, text, true);
      });
    };

    var sAssertIframeHtmlNotContains = function (editor, text) {
      return Step.sync(function () {
        assertIframeContains(editor, text, false);
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyApis.sSetContent('<p>hello world</p>'),
        tinyApis.sSetSetting('content_style', 'p {color: blue;}'),
        sAssertIframeHtmlContains(editor, '<style type="text/css">p {color: blue;}</style>'),
        tinyApis.sDeleteSetting('content_style'),
        sAssertIframeHtmlNotContains(editor, '<style type="text/css">p {color: blue;}</style>')
      ], onSuccess, onFailure);
    }, {
      plugins: 'preview',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);