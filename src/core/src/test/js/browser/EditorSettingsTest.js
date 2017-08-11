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
        }),

        Step.sync(function () {
          var fakeEditor = {
            settings: {
              string: 'a',
              number: 1,
              boolTrue: true,
              boolFalse: false,
              null: null,
              undef: undefined
            }
          };

          Assertions.assertEq('Should be none for non existing setting', true, EditorSettings.get(fakeEditor, 'non_existing').isNone());
          Assertions.assertEq('Should be none for existing null setting', true, EditorSettings.get(fakeEditor, 'non_existing').isNone());
          Assertions.assertEq('Should be none for existing undefined setting', true, EditorSettings.get(fakeEditor, 'undef').isNone());
          Assertions.assertEq('Should be some for existing string setting', 'a', EditorSettings.get(fakeEditor, 'string').getOrDie());
          Assertions.assertEq('Should be some for existing number setting', 1, EditorSettings.get(fakeEditor, 'number').getOrDie());
          Assertions.assertEq('Should be some for existing bool setting', true, EditorSettings.get(fakeEditor, 'boolTrue').getOrDie());
          Assertions.assertEq('Should be some for existing bool setting', false, EditorSettings.get(fakeEditor, 'boolFalse').getOrDie());
          Assertions.assertEq('Should be none for non existing setting', true, EditorSettings.getString(fakeEditor, 'non_existing').isNone());
          Assertions.assertEq('Should be some for existing string setting', 'a', EditorSettings.getString(fakeEditor, 'string').getOrDie());
          Assertions.assertEq('Should be none for existing number setting', true, EditorSettings.getString(fakeEditor, 'number').isNone());
          Assertions.assertEq('Should be none for existing bool setting', true, EditorSettings.getString(fakeEditor, 'boolTrue').isNone());
        })
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);