asynctest(
  'browser.tinymce.core.EditorSettingsTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sand.api.PlatformDetection',
    'tinymce.core.EditorSettings',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Logger, Pipeline, Step, TinyLoader, PlatformDetection, EditorSettings, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var detection = PlatformDetection.detect();
    var isTouch = detection.deviceType.isTouch();

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

        Logger.t('Getters for varous setting types', Step.sync(function () {
          var settings = EditorSettings.getEditorSettings(
            {},
            'id',
            'documentBaseUrl',
            {
              plugins: ['a']
            },
            {
              string: 'a',
              number: 1,
              boolTrue: true,
              boolFalse: false,
              null: null,
              undef: undefined
            }
          );

          var fakeEditor = {
            settings: settings
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
        })),

        Logger.t('Mobile override', Step.sync(function () {
          var settings = EditorSettings.getEditorSettings(
            {},
            'id',
            'documentBaseUrl',
            {
              settingB: false
            },
            {
              mobile: {
                settingA: true,
                settingB: true
              }
            }
          );

          var fakeEditor = {
            settings: settings
          };

          Assertions.assertEq('Should only have the mobile setting on touch', EditorSettings.get(fakeEditor, 'settingA').getOr(false), isTouch);
          Assertions.assertEq('Should not have a mobile setting on desktop', EditorSettings.get(fakeEditor, 'settingA').isNone(), !isTouch);
          Assertions.assertEq('Should have the expected mobile setting value on touch', EditorSettings.get(fakeEditor, 'settingB').getOr(false), isTouch);
          Assertions.assertEq('Should have the expected desktop setting on desktop', EditorSettings.get(fakeEditor, 'settingB').getOr(true), isTouch);
        })),

        Logger.t('Normalize and filter mobile plugins', Step.sync(function () {
          Assertions.assertEq('Should be empty since a and b is not valid mobile plugins', '', EditorSettings.filterMobilePlugins('a b'));
          Assertions.assertEq('Should be lists since lists is a valid plugin', 'lists', EditorSettings.filterMobilePlugins('a lists b'));
          Assertions.assertEq('Should be lists since lists and autolink are valid plugins', 'lists autolink', EditorSettings.filterMobilePlugins('a lists b autolink'));
          Assertions.assertEq('Should be empty since a and b is not valid mobile plugins', '', EditorSettings.filterMobilePlugins(['  a   b  ']));
          Assertions.assertEq('Should be lists since lists and autolink are valid plugins', 'lists autolink', EditorSettings.filterMobilePlugins(['  a  lists  ', '  autolink   b  ']));
        }))
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);