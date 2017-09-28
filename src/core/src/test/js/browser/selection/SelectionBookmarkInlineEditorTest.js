asynctest(
  'browser.tinymce.core.selection.SelectionBookmarkInlineEditorTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, Step, TinyApis, TinyLoader, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      Pipeline.async({}, [
        tinyApis.sSetContent('<p>a</p><p>b</p>'),
        tinyApis.sSetSelection([0, 0], 0, [1, 0], 1),
        Step.wait(9000)

      ], onSuccess, onFailure);
    }, {
      inline: true,
      plugins: '',
      toolbar: '',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);