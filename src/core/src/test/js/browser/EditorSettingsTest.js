asynctest(
  'browser.tinymce.core.EditorSettingsTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.EditorSettings',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Pipeline, Step, TinyLoader, EditorSettings, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, [
        Step.sync(function () {
          var settings = EditorSettings.getEditorSettings(
            editor,
            'id',
            'documentBaseUrl',
            {
              plugins: ['a']
            },
            {
              validate: false,
              userSetting: 'x'
            }
          );

          Assertions.assertEq('Should have the specified id', 'id', settings.id);
          Assertions.assertEq('Should have the specified documentBaseUrl', 'documentBaseUrl', settings.document_base_url);
          Assertions.assertEq('Should have the specified userSetting', 'x', settings.userSetting);
          Assertions.assertEq('Should have the forced validate setting', true, settings.validate);
          Assertions.assertEq('Should have the default theme', 'modern', settings.theme);
          Assertions.assertEq('Should have the default overrides plugins', ['a'], settings.plugins);
        })
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);