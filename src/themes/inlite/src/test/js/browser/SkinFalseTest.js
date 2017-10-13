asynctest(
  'browser.tinymce.themes.inlite.SkinFalseTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.themes.inlite.Theme'
  ],
  function (Pipeline, TinyLoader, InliteTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    InliteTheme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      // This is a weird test that only checks that the skinloaded event is fired even if skin is set to false
      Pipeline.async({}, [
      ], onSuccess, onFailure);
    }, {
      skin: false,
      inline: true,
      theme: 'inlite',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);