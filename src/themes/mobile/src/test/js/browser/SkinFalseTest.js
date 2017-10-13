asynctest(
  'browser.tinymce.themes.mobile.SkinFalseTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.themes.mobile.Theme'
  ],
  function (Pipeline, TinyLoader, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {

      // This is a weird test that only checks that the skinloaded event is fired even if skin is set to false
      Pipeline.async({}, [
      ], onSuccess, onFailure);
    }, {
      skin: false,
      theme: 'mobile',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);