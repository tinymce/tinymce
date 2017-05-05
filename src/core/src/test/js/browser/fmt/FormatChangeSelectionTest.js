asynctest(
  'Browser Test: .fmt.FormatChangeSelectionTest',
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
        tinyApis.sSetContent('<p><span style="text-decoration: underline;"><em><strong>a b c</strong></em></span></p>'),
        tinyApis.sSetSelection([0, 0, 0, 0, 0], 2, [0, 0, 0, 0, 0], 3),
        tinyApis.sExecCommand('bold'),
        tinyApis.sExecCommand('italic'),
        tinyApis.sAssertSelection([0, 0, 0, 0, 0], 2, [0, 0, 0, 0, 0], 3)
        // Step.wait(20000000)
      ], onSuccess, onFailure);
    }, {
      plugins: '',
      toolbar: '',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);