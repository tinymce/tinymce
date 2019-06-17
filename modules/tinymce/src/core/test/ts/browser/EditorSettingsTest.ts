import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import * as EditorSettings from 'tinymce/core/EditorSettings';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';

UnitTest.asynctest('browser.tinymce.core.EditorSettingsTest', function (success, failure) {
  const detection = PlatformDetection.detect();
  const isTouch = detection.deviceType.isTouch();
  const isiPhone = detection.deviceType.isiPhone();

  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [
      Logger.t('getEditorSettings tests', GeneralSteps.sequence([
        Logger.t('Override defaults plugins', Step.sync(function () {
          const settings = EditorSettings.getEditorSettings(
            editor,
            'id',
            'documentBaseUrl',
            {
              defaultSetting: 'a',
              plugins: ['a']
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
          Assertions.assertEq('Should have the default theme', 'silver', settings.theme);
          Assertions.assertEq('Should have the specified default plugin', 'a', settings.plugins);
          Assertions.assertEq('Should have the default setting', 'a', settings.defaultSetting);
        })),

        Logger.t('Override defaults with forced_plugins using arrays', Step.sync(function () {
          const defaultSettings = {
            forced_plugins: ['a', 'b']
          };

          const userSettings = {
            plugins: ['c', 'd']
          };

          const settings = EditorSettings.getEditorSettings(editor, 'id', 'documentBaseUrl', defaultSettings, userSettings);

          Assertions.assertEq('Should be both forced and user plugins', 'a b c d', settings.plugins);
        })),

        Logger.t('Override defaults with forced_plugins using strings', Step.sync(function () {
          const defaultSettings = {
            forced_plugins: 'a b'
          };

          const userSettings = {
            plugins: 'c d'
          };

          const settings = EditorSettings.getEditorSettings(editor, 'id', 'documentBaseUrl', defaultSettings, userSettings);

          Assertions.assertEq('Should be both forced and user plugins', 'a b c d', settings.plugins);
        })),

        Logger.t('Override defaults with forced_plugins using mixed types and spaces', Step.sync(function () {
          const defaultSettings = {
            forced_plugins: '  a   b'
          };

          const userSettings = {
            plugins: [' c ', '  d   e ']
          };

          const settings = EditorSettings.getEditorSettings(editor, 'id', 'documentBaseUrl', defaultSettings, userSettings);

          Assertions.assertEq('Should be both forced and user plugins', 'a b c d e', settings.plugins);
        })),

        Logger.t('Override defaults with just default forced_plugins', Step.sync(function () {
          const defaultSettings = {
            forced_plugins: ['a', 'b']
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
            plugins: ['a', 'b']
          };

          const settings = EditorSettings.getEditorSettings(editor, 'id', 'documentBaseUrl', defaultSettings, userSettings);

          Assertions.assertEq('Should be just user plugins', 'a b', settings.plugins);
        })),

        Logger.t('Override defaults with forced_plugins should not be possible to override', Step.sync(function () {
          const defaultSettings = {
            forced_plugins: ['a', 'b']
          };

          const userSettings = {
            forced_plugins: ['a'],
            plugins: ['c', 'd']
          };

          const settings = EditorSettings.getEditorSettings(editor, 'id', 'documentBaseUrl', defaultSettings, userSettings);

          Assertions.assertEq('Should be just forced and user plugins', 'a b c d', settings.plugins);
        })),

        Logger.t('Getters for various setting types', Step.sync(function () {
          const settings = EditorSettings.getEditorSettings(
            {} as Editor,
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
            'Should be have validate forced and empty plugins the merged settings',
            { a: 1, b: 2, c: 3, validate: true, external_plugins: {}, plugins: '' },
            EditorSettings.combineSettings(false, { a: 1, b: 1, c: 1 }, { b: 2 }, { c: 3 })
          );
        })),

        Logger.t('Merged settings forced_plugins in default override settings (desktop)', Step.sync(function () {
          Assertions.assertEq(
            'Should be have plugins merged with forced plugins',
            { validate: true, external_plugins: {}, forced_plugins: ['a'], plugins: 'a b' },
            EditorSettings.combineSettings(false, {}, { forced_plugins: ['a'] }, { plugins: ['b'] })
          );
        })),

        Logger.t('Merged settings (mobile)', Step.sync(function () {
          Assertions.assertEq(
            'Should be have validate forced and empty plugins the merged settings',
            { a: 1, b: 2, c: 3, validate: true, external_plugins: {}, plugins: '' },
            EditorSettings.combineSettings(true, { a: 1, b: 1, c: 1 }, { b: 2 }, { c: 3 })
          );
        })),

        Logger.t('Merged settings forced_plugins in default override settings (mobile)', Step.sync(function () {
          Assertions.assertEq(
            'Should be have plugins merged with forced plugins',
            { validate: true, external_plugins: {}, forced_plugins: ['a'], plugins: 'a b' },
            EditorSettings.combineSettings(true, {}, { forced_plugins: ['a'] }, { plugins: ['b'] })
          );
        })),

        Logger.t('Merged settings forced_plugins in default override settings with user mobile settings (desktop)', Step.sync(function () {
          Assertions.assertEq(
            'Should not have plugins merged with mobile plugins',
            { validate: true, external_plugins: {}, forced_plugins: ['a'], plugins: 'a b' },
            EditorSettings.combineSettings(false, {}, { forced_plugins: ['a'] }, { plugins: ['b'], mobile: { plugins: ['c'] } })
          );
        })),

        Logger.t('Merged settings forced_plugins in default override settings with user mobile settings (mobile)', Step.sync(function () {
          Assertions.assertEq(
            'Should have forced_plugins merged with mobile plugins but only whitelisted user plugins',
            { validate: true, external_plugins: {}, forced_plugins: ['a'], plugins: 'a lists', ...(isiPhone ? { theme: 'mobile' } : { } )  },
            EditorSettings.combineSettings(true, {}, { forced_plugins: ['a'] }, { plugins: ['b'], mobile: { plugins: ['lists custom'] } })
          );
        })),

        Logger.t('Merged settings forced_plugins in default override forced_plugins in user settings', Step.sync(function () {
          Assertions.assertEq(
            'Should not have user forced plugins',
            { validate: true, external_plugins: {}, forced_plugins: ['b'], plugins: 'a' },
            EditorSettings.combineSettings(false, {}, { forced_plugins: ['a'] }, { forced_plugins: ['b'] })
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
          strArr: ['a', 'b'],
          mixedArr: ['a', 3]
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
        Assertions.assertEq('Should be expected string array', ['a', 'b'], EditorSettings.getParam(editor, 'strArr', ['x'], 'string[]'));
        Assertions.assertEq('Should be expected default array on mixed types', ['x'], EditorSettings.getParam(editor, 'mixedArr', ['x'], 'string[]'));
        Assertions.assertEq('Should be expected default array on boolean', ['x'], EditorSettings.getParam(editor, 'bool', ['x'], 'string[]'));
      }))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
