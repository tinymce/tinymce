asynctest(
  'browser.tinymce.themes.modern.SkinFalseTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, TinyLoader, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      // This is a weird test that only checks that the skinloaded event is fired even if skin is set to false
      Pipeline.async({}, [
      ], onSuccess, onFailure);
    }, {
      skin: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);