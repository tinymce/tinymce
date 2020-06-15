import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import * as EditorSettings from 'tinymce/core/EditorSettings';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.EditorSettingsTest', function (success, failure) {
  const detection = PlatformDetection.detect();
  const isTouch = detection.deviceType.isTouch();
  const isPhone = detection.deviceType.isPhone();

  Theme();

  const expectedDefaultSettings: RawEditorSettings = {
    toolbar_mode: 'floating'
  };

  const expectedTouchDefaultSettings: RawEditorSettings = {
    ...expectedDefaultSettings,
    table_grid: false,
    object_resizing: false,
    resize: false
  };

  const expectedTabletDefaultSettings: RawEditorSettings = {
    ...expectedTouchDefaultSettings,
    toolbar_mode: 'scrolling',
    toolbar_sticky: false
  };

  const expectedPhoneDefaultSettings: RawEditorSettings = {
    ...expectedTabletDefaultSettings,
    menubar: false
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [
      Logger.t('default desktop settings', Step.sync(() => {
        const defaultSettings = EditorSettings.getDefaultSettings({}, 'id', 'documentBaseUrl', false, editor);
        Obj.each(expectedDefaultSettings, (value, key) => {
          Assertions.assertEq(`Should have default ${key} setting`, value, Obj.get(defaultSettings, key).getOrUndefined());
        });
        Obj.each(expectedPhoneDefaultSettings, (value, key) => {
          Assertions.assertEq(`Should not have default ${key} mobile setting`, true, value !== Obj.get(defaultSettings, key).getOrUndefined());
        });
      })),

      Logger.t('default touch device settings', Step.sync(() => {
        const defaultSettings = EditorSettings.getDefaultSettings({}, 'id', 'documentBaseUrl', true, editor);
        Obj.each(expectedTouchDefaultSettings, (value, key) => {
          Assertions.assertEq(`Should have default ${key} setting`, value, Obj.get(defaultSettings, key).getOrUndefined());
        });
      })),

      Logger.t('when unset, toolbar_mode should fall back to the value of toolbar_drawer', Step.sync(() => {
        const toolbarSettings: RawEditorSettings = {
          toolbar_drawer: 'sliding'
        };

        const defaultSettings = EditorSettings.getDefaultSettings(toolbarSettings, 'id', 'documentBaseUrl', true, editor);
        Assertions.assertEq('Should fall back to value of toolbar_drawer', true, defaultSettings.toolbar_mode === 'sliding');

        const mobileDefaultSettings = EditorSettings.getDefaultMobileSettings(toolbarSettings, false);
        Assertions.assertEq('Should fall back to value of toolbar_drawer', true, mobileDefaultSettings.toolbar_mode === 'sliding');
      })),

      Logger.t('default tablet settings', Step.sync(() => {
        const defaultSettings = EditorSettings.getDefaultMobileSettings({}, false);
        Obj.each(expectedTabletDefaultSettings, (value, key) => {
          Assertions.assertEq(`Should have default ${key} setting`, value, Obj.get(defaultSettings, key).getOrUndefined());
        });
        Assertions.assertEq('Should not have menubar setting', undefined, Obj.get(defaultSettings, 'menubar').getOrUndefined());
      })),

      Logger.t('default phone settings', Step.sync(() => {
        const defaultSettings = EditorSettings.getDefaultMobileSettings({}, true);
        Obj.each(expectedPhoneDefaultSettings, (value, key) => {
          Assertions.assertEq(`Should have default ${key} setting`, value, Obj.get(defaultSettings, key).getOrUndefined());
        });
      })),

      Logger.t('desktop settings should not override mobile default settings', Step.sync(() => {
        const settings: RawEditorSettings = {
          toolbar_mode: 'sliding',
          table_grid: true,
          object_resizing: true,
          toolbar_sticky: true,
          resize: 'both',
          menubar: true
        };

        const mobileSettings = EditorSettings.combineSettings(true, true, {}, {}, settings);
        Obj.each(expectedPhoneDefaultSettings, (value, key) => {
          Assertions.assertEq(`Should have default ${key} setting`, value, Obj.get(mobileSettings, key).getOrUndefined());
        });
      })),

      Logger.t('getEditorSettings tests', GeneralSteps.sequence([
        Logger.t('Override defaults plugins', Step.sync(function () {
          const settings = EditorSettings.getEditorSettings(
            editor,
            'id',
            'documentBaseUrl',
            {
              defaultSetting: 'a',
              plugins: [ 'a' ]
            },
            {
              validate: false,
              userSetting: 'b'
            }
          );

          Assertions.assertEq('Should have the specified id', 'id', settings.id);
          Assertions.assertEq('Should have the specified documentBaseUrl', 'documentBaseUrl', settings.document_base_url);
          Assertions.assertEq('Should have the specified userSetting', 'b', settings.userSetting);
          Assertions.assertEq('Should have the forced validate setting', true, settings.validate);
          Assertions.assertEq('Should have the default theme', isPhone ? 'mobile' : 'silver', settings.theme);
          Assertions.assertEq('Should have the specified default plugin', isPhone ? '' : 'a', settings.plugins);
          Assertions.assertEq('Should have the default setting', 'a', settings.defaultSetting);
        })),

        Logger.t('Override defaults with forced_plugins using arrays', Step.sync(function () {
          const defaultSettings = {
            forced_plugins: [ 'a', 'b' ]
          };

          const userSettings = {
            plugins: [ 'c', 'd' ]
          };

          const settings = EditorSettings.getEditorSettings(editor, 'id', 'documentBaseUrl', defaultSettings, userSettings);

          Assertions.assertEq('Should be both forced and user plugins', isPhone ? 'a b' : 'a b c d', settings.plugins);
        })),

        Logger.t('Override defaults with forced_plugins using strings', Step.sync(function () {
          const defaultSettings = {
            forced_plugins: 'a b'
          };

          const userSettings = {
            plugins: 'c d'
          };

          const settings = EditorSettings.getEditorSettings(editor, 'id', 'documentBaseUrl', defaultSettings, userSettings);

          Assertions.assertEq('Should be both forced and user plugins', isPhone ? 'a b' : 'a b c d', settings.plugins);
        })),

        Logger.t('Override defaults with forced_plugins using mixed types and spaces', Step.sync(function () {
          const defaultSettings = {
            forced_plugins: '  a   b'
          };

          const userSettings = {
            plugins: [ ' c ', '  d   e ' ]
          };

          const settings = EditorSettings.getEditorSettings(editor, 'id', 'documentBaseUrl', defaultSettings, userSettings);

          Assertions.assertEq('Should be both forced and user plugins', isPhone ? 'a b' : 'a b c d e', settings.plugins);
        })),

        Logger.t('Override defaults with just default forced_plugins', Step.sync(function () {
          const defaultSettings = {
            forced_plugins: [ 'a', 'b' ]
          };

          const userSettings = {
          };

          const settings = EditorSettings.getEditorSettings(editor, 'id', 'documentBaseUrl', defaultSettings, userSettings);

          Assertions.assertEq('Should be just default plugins', 'a b', settings.plugins);
        })),

        Logger.t('Override defaults with just user plugins', Step.sync(function () {
          const defaultSettings = {
          };

          const userSettings = {
            plugins: [ 'a', 'b' ]
          };

          const settings = EditorSettings.getEditorSettings(editor, 'id', 'documentBaseUrl', defaultSettings, userSettings);

          Assertions.assertEq('Should be just user plugins', isPhone ? '' : 'a b', settings.plugins);
        })),

        Logger.t('Override defaults with forced_plugins should not be possible to override', Step.sync(function () {
          const defaultSettings = {
            forced_plugins: [ 'a', 'b' ]
          };

          const userSettings = {
            forced_plugins: [ 'a' ],
            plugins: [ 'c', 'd' ]
          };

          const settings = EditorSettings.getEditorSettings(editor, 'id', 'documentBaseUrl', defaultSettings, userSettings);

          Assertions.assertEq('Should be just forced and user plugins', isPhone ? 'a b' : 'a b c d', settings.plugins);
        })),

        Logger.t('Getters for various setting types', Step.sync(function () {
          const settings = EditorSettings.getEditorSettings(
            {} as Editor,
            'id',
            'documentBaseUrl',
            {
              plugins: [ 'a' ]
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

          const fakeEditor = {
            settings
          } as Editor;

          Assertions.assertEq('Should be undefined for non existing setting', undefined, EditorSettings.getParam(fakeEditor, 'non_existing'));
          Assertions.assertEq('Should be undefined for existing null setting', undefined, EditorSettings.getParam(fakeEditor, 'non_existing'));
          Assertions.assertEq('Should be undefined for existing undefined setting', undefined, EditorSettings.getParam(fakeEditor, 'undef'));
          Assertions.assertEq('Should be some for existing string setting', 'a', EditorSettings.getParam(fakeEditor, 'string'));
          Assertions.assertEq('Should be some for existing number setting', 1, EditorSettings.getParam(fakeEditor, 'number'));
          Assertions.assertEq('Should be some for existing bool setting', true, EditorSettings.getParam(fakeEditor, 'boolTrue'));
          Assertions.assertEq('Should be some for existing bool setting', false, EditorSettings.getParam(fakeEditor, 'boolFalse'));
          Assertions.assertEq('Should be undefined for non existing setting', undefined, EditorSettings.getParam(fakeEditor, 'non_existing', undefined, 'string'));
          Assertions.assertEq('Should be some for existing string setting', 'a', EditorSettings.getParam(fakeEditor, 'string', undefined, 'string'));
          Assertions.assertEq('Should be undefined for existing number setting', undefined, EditorSettings.getParam(fakeEditor, 'number', undefined, 'string'));
          Assertions.assertEq('Should be undefined for existing bool setting', undefined, EditorSettings.getParam(fakeEditor, 'boolTrue', undefined, 'string'));
        })),

        Logger.t('Mobile override', Step.sync(function () {
          const settings = EditorSettings.getEditorSettings(
            {} as Editor,
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

          const fakeEditor = {
            settings
          } as Editor;

          Assertions.assertEq('Should only have the mobile setting on touch', EditorSettings.getParam(fakeEditor, 'settingA', false), isTouch);
          Assertions.assertEq('Should have the expected mobile setting value on touch', EditorSettings.getParam(fakeEditor, 'settingB', false), isTouch);
          Assertions.assertEq('Should have the expected desktop setting on desktop', EditorSettings.getParam(fakeEditor, 'settingB', true), isTouch);
        }))
      ])),

      Logger.t('combineSettings tests', GeneralSteps.sequence([
        Logger.t('Merged settings (desktop)', Step.sync(function () {
          Assertions.assertEq(
            'Should have validate, forced and empty plugins in the merged settings',
            { a: 1, b: 2, c: 3, validate: true, external_plugins: {}, plugins: '' },
            EditorSettings.combineSettings(false, false, { a: 1, b: 1, c: 1 }, { b: 2 }, { c: 3 })
          );
        })),

        Logger.t('Merged settings forced_plugins in default override settings (desktop)', Step.sync(function () {
          Assertions.assertEq(
            'Should have plugins merged with forced plugins',
            { validate: true, external_plugins: {}, forced_plugins: [ 'a' ], plugins: 'a b' },
            EditorSettings.combineSettings(false, false, {}, { forced_plugins: [ 'a' ] }, { plugins: [ 'b' ] })
          );
        })),

        Logger.t('Merged settings forced_plugins in default override settings (mobile)', Step.sync(function () {
          Assertions.assertEq(
            'Should be have plugins merged with forced plugins',
            { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, forced_plugins: [ 'a' ], plugins: 'a b' },
            EditorSettings.combineSettings(true, true, {}, { forced_plugins: [ 'a' ] }, { plugins: [ 'b' ] })
          );
        })),

        Logger.t('Merged settings forced_plugins in default override settings with user mobile settings (desktop)', Step.sync(function () {
          Assertions.assertEq(
            'Should not have plugins merged with mobile plugins',
            { validate: true, external_plugins: {}, forced_plugins: [ 'a' ], plugins: 'a b' },
            EditorSettings.combineSettings(false, false, {}, { forced_plugins: [ 'a' ] }, { plugins: [ 'b' ], mobile: { plugins: [ 'c' ], toolbar_sticky: true }})
          );
        })),

        Logger.t('Merged settings forced_plugins in default override settings with user mobile settings (mobile)', Step.sync(function () {
          Assertions.assertEq(
            'Should have forced_plugins merged with mobile plugins but only whitelisted user plugins',
            { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, forced_plugins: [ 'a' ], plugins: 'a lists', theme: 'mobile', toolbar_sticky: true },
            EditorSettings.combineSettings(true, true, {}, { forced_plugins: [ 'a' ] }, { plugins: [ 'b' ], mobile: { plugins: [ 'lists custom' ], theme: 'mobile', toolbar_sticky: true }})
          );
        })),

        Logger.t('Merged settings forced_plugins in default override settings with user mobile settings (mobile)', Step.sync(function () {
          Assertions.assertEq(
            'Should not merge forced_plugins with mobile plugins when theme is not mobile',
            { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, forced_plugins: [ 'a' ], plugins: 'a lists custom' },
            EditorSettings.combineSettings(true, true, {}, { forced_plugins: [ 'a' ] }, { plugins: [ 'b' ], mobile: { plugins: [ 'lists custom' ] }})
          );
        })),

        Logger.t('Merged settings forced_plugins in default override forced_plugins in user settings', Step.sync(function () {
          Assertions.assertEq(
            'Should not have user forced plugins',
            { validate: true, external_plugins: {}, forced_plugins: [ 'b' ], plugins: 'a' },
            EditorSettings.combineSettings(false, false, {}, { forced_plugins: [ 'a' ] }, { forced_plugins: [ 'b' ] })
          );
        })),

        Logger.t('Merged settings when theme is mobile, on a mobile device', Step.sync(function () {
          Assertions.assertEq(
            'Should fallback to filtered white listed. settings.plugins ',
            { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, plugins: 'lists autolink', theme: 'mobile' },
            EditorSettings.combineSettings(true, true, {}, {}, { mobile: { theme: 'mobile' }, plugins: [ 'lists', 'b', 'autolink' ] })
          );
        })),

        Logger.t('Merged settings when mobile.plugins is undefined, on a mobile device', Step.sync(function () {
          Assertions.assertEq(
            'Should use settings.plugins when mobile theme is not set',
            { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, plugins: 'lists b autolink', theme: 'silver' },
            EditorSettings.combineSettings(true, true, {}, {}, { theme: 'silver', plugins: [ 'lists', 'b', 'autolink' ], mobile: {}})
          );
        })),

        Logger.t('Merged settings when mobile.plugins is undefined, legacy mobile theme and on a mobile device', Step.sync(function () {
          Assertions.assertEq(
            'Should fallback to filtered white listed. settings.plugins',
            { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, plugins: 'lists autolink', theme: 'mobile' },
            EditorSettings.combineSettings(true, true, {}, {}, { theme: 'silver', plugins: [ 'lists', 'b', 'autolink' ], mobile: { theme: 'mobile' }})
          );
        })),

        Logger.t('Merged settings with empty mobile.plugins="" on mobile', Step.sync(function () {
          Assertions.assertEq(
            'Should not have any plugins when mobile.plugins is explicitly empty',
            { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, plugins: '' },
            EditorSettings.combineSettings(true, true, {}, {}, { mobile: { plugins: '' }})
          );
        })),

        Logger.t('Merged settings with defined mobile.plugins', Step.sync(function () {
          Assertions.assertEq(
            'Should allow all plugins',
            { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, plugins: 'lists autolink foo bar' },
            EditorSettings.combineSettings(true, true, {}, {}, { mobile: { plugins: [ 'lists', 'autolink', 'foo', 'bar' ] }})
          );
        })),

        Logger.t('Merged settings with defined mobile.plugins and legacy mobile theme', Step.sync(function () {
          Assertions.assertEq(
            'Should fallback to filtered white listed',
            { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, plugins: 'lists autolink', theme: 'mobile' },
            EditorSettings.combineSettings(true, true, {}, {}, { mobile: { theme: 'mobile', plugins: [ 'lists', 'autolink', 'foo', 'bar' ] }})
          );
        })),

        Logger.t('Merged settings with mobile.theme silver and mobile.plugins', Step.sync(function () {
          Assertions.assertEq(
            'Should allow all mobile plugin',
            { ...expectedPhoneDefaultSettings, validate: true, theme: 'silver', external_plugins: {}, plugins: 'lists autolink foo bar' },
            EditorSettings.combineSettings(true, true, {}, {}, { theme: 'test', mobile: { plugins: [ 'lists', 'autolink', 'foo', 'bar' ], theme: 'silver' }})
          );
        })),

        Logger.t('Merged settings with mobile.theme silver and mobile.plugins on Desktop', Step.sync(function () {
          Assertions.assertEq(
            'Should respect the desktop settings',
            { validate: true, theme: 'silver', external_plugins: {}, plugins: 'aa bb cc' },
            EditorSettings.combineSettings(false, false, {}, {}, {
              theme: 'silver',
              plugins: [ 'aa', 'bb', 'cc' ],
              mobile: { plugins: [ 'lists', 'autolink', 'foo', 'bar' ], theme: 'silver' }
            })
          );
        }))
      ])),

      Logger.t('getParam hash (legacy)', Step.sync(function () {
        const editor = new Editor('id', {
          hash1: 'a,b,c',
          hash2: 'a',
          hash3: 'a=b',
          hash4: 'a=b;c=d,e',
          hash5: 'a=b,c=d'
        }, EditorManager);

        Assertions.assertEq('Should be expected object', { a: 'a', b: 'b', c: 'c' }, EditorSettings.getParam(editor, 'hash1', {}, 'hash'));
        Assertions.assertEq('Should be expected object', { a: 'a' }, EditorSettings.getParam(editor, 'hash2', {}, 'hash'));
        Assertions.assertEq('Should be expected object', { a: 'b' }, EditorSettings.getParam(editor, 'hash3', {}, 'hash'));
        Assertions.assertEq('Should be expected object', { a: 'b', c: 'd,e' }, EditorSettings.getParam(editor, 'hash4', {}, 'hash'));
        Assertions.assertEq('Should be expected object', { a: 'b', c: 'd' }, EditorSettings.getParam(editor, 'hash5', {}, 'hash'));
        Assertions.assertEq('Should be expected default object', { b: 2 }, EditorSettings.getParam(editor, 'hash_undefined', { b: 2 }, 'hash'));
      })),
      Logger.t('getParam primary types', Step.sync(function () {
        const editor = new Editor('id', {
          bool: true,
          str: 'a',
          num: 2,
          obj: { a: 1 },
          arr: [ 'a' ],
          fun: () => {},
          strArr: [ 'a', 'b' ],
          mixedArr: [ 'a', 3 ]
        }, EditorManager);

        Assertions.assertEq('Should be expected bool', true, EditorSettings.getParam(editor, 'bool', false, 'boolean'));
        Assertions.assertEq('Should be expected string', 'a', EditorSettings.getParam(editor, 'str', 'x', 'string'));
        Assertions.assertEq('Should be expected number', 2, EditorSettings.getParam(editor, 'num', 1, 'number'));
        Assertions.assertEq('Should be expected object', { a: 1 }, EditorSettings.getParam(editor, 'obj', {}, 'object'));
        Assertions.assertEq('Should be expected array', [ 'a' ], EditorSettings.getParam(editor, 'arr', [], 'array'));
        Assertions.assertEq('Should be expected function', 'function', typeof EditorSettings.getParam(editor, 'fun', null, 'function'));
        Assertions.assertEq('Should be expected default bool', false, EditorSettings.getParam(editor, 'bool_undefined', false, 'boolean'));
        Assertions.assertEq('Should be expected default string', 'x', EditorSettings.getParam(editor, 'str_undefined', 'x', 'string'));
        Assertions.assertEq('Should be expected default number', 1, EditorSettings.getParam(editor, 'num_undefined', 1, 'number'));
        Assertions.assertEq('Should be expected default object', {}, EditorSettings.getParam(editor, 'obj_undefined', {}, 'object'));
        Assertions.assertEq('Should be expected default array', [], EditorSettings.getParam(editor, 'arr_undefined', [], 'array'));
        Assertions.assertEq('Should be expected default function', null, EditorSettings.getParam(editor, 'fun_undefined', null, 'function'));
        Assertions.assertEq('Should be expected string array', [ 'a', 'b' ], EditorSettings.getParam(editor, 'strArr', [ 'x' ], 'string[]'));
        Assertions.assertEq('Should be expected default array on mixed types', [ 'x' ], EditorSettings.getParam(editor, 'mixedArr', [ 'x' ], 'string[]'));
        Assertions.assertEq('Should be expected default array on boolean', [ 'x' ], EditorSettings.getParam(editor, 'bool', [ 'x' ], 'string[]'));
      }))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
