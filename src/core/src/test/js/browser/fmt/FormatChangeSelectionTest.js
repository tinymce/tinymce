asynctest(
  'browser.tinymce.core.fmt.FormatChangeSelectionTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, TinyApis, TinyLoader, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyApis.sSetContent('<p><em><strong>a </strong>b<strong> c</strong></em></p>'),
        tinyApis.sSetSelection([0, 0, 1], 0, [0, 0, 2], 0),
        tinyApis.sExecCommand('italic'),
        tinyApis.sAssertContent('<p><em><strong>a </strong></em>b<em><strong> c</strong></em></p>'),
        tinyApis.sAssertSelection([0, 1], 0, [0, 2], 0)
      ], onSuccess, onFailure);
    }, {
      plugins: '',
      toolbar: '',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);