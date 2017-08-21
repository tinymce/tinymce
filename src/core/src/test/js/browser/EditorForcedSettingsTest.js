asynctest(
  'browser.tinymce.core.EditorForcedSettingsTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Pipeline, TinyLoader, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, [
        Assertions.sAssertEq('Validate should always be true', true, editor.settings.validate),
        Assertions.sAssertEq('Validate should true since inline was set to true', true, editor.settings.content_editable)
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray',

      // Setting exposed as another forced setting
      inline: true,

      // Settings that are to be forced
      validate: false
    }, success, failure);
  }
);