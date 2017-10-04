asynctest(
  'browser.tinymce.core.InitEditorNoThemeIframe',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader'
  ],
  function (GeneralSteps, Logger, Pipeline, TinyApis, TinyLoader) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('Tests if the editor is responsive after setting theme to false', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sAssertContent('<p>a</p>')
        ]))
      ], onSuccess, onFailure);
    }, {
      theme: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      init_instance_callback: function (editor) {
        editor.fire('SkinLoaded');
      }
    }, success, failure);
  }
);