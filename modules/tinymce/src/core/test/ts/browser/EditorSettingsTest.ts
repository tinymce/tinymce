import { context, describe, it } from '@ephox/bedrock-client';
import { Fun, Obj } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import * as EditorSettings from 'tinymce/core/EditorSettings';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.EditorSettingsTest', () => {
  const detection = PlatformDetection.detect();
  const isTouch = detection.deviceType.isTouch();
  const isPhone = detection.deviceType.isPhone();

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

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

  it('default desktop settings', () => {
    const defaultSettings = EditorSettings.getDefaultSettings({}, 'id', 'documentBaseUrl', false, hook.editor());
    Obj.each(expectedDefaultSettings, (value, key) => {
      assert.propertyVal(defaultSettings, key, value, `Should have default ${key} setting`);
    });
    Obj.each(expectedPhoneDefaultSettings, (value, key) => {
      assert.notPropertyVal(defaultSettings, key, value, `Should not have default ${key} mobile setting`);
    });
  });

  it('default touch device settings', () => {
    const defaultSettings = EditorSettings.getDefaultSettings({}, 'id', 'documentBaseUrl', true, hook.editor());
    Obj.each(expectedTouchDefaultSettings, (value, key) => {
      assert.propertyVal(defaultSettings, key, value, `Should have default ${key} setting`);
    });
  });

  it('when unset, toolbar_mode should fall back to the value of toolbar_drawer', () => {
    const toolbarSettings: RawEditorSettings = {
      toolbar_drawer: 'sliding'
    };

    const defaultSettings = EditorSettings.getDefaultSettings(toolbarSettings, 'id', 'documentBaseUrl', true, hook.editor());
    assert.propertyVal(defaultSettings, 'toolbar_mode', 'sliding', 'Should fall back to value of toolbar_drawer (desktop)');

    const mobileDefaultSettings = EditorSettings.getDefaultMobileSettings(toolbarSettings, false);
    assert.propertyVal(mobileDefaultSettings, 'toolbar_mode', 'sliding', 'Should fall back to value of toolbar_drawer (mobile)');
  });

  it('default tablet settings', () => {
    const defaultSettings = EditorSettings.getDefaultMobileSettings({}, false);
    Obj.each(expectedTabletDefaultSettings, (value, key) => {
      assert.propertyVal(defaultSettings, key, value, `Should have default ${key} setting`);
    });
    assert.notProperty(defaultSettings, 'menubar', 'Should not have menubar setting');
  });

  it('default phone settings', () => {
    const defaultSettings = EditorSettings.getDefaultMobileSettings({}, true);
    Obj.each(expectedPhoneDefaultSettings, (value, key) => {
      assert.propertyVal(defaultSettings, key, value, `Should have default ${key} setting`);
    });
  });

  it('desktop settings should not override mobile default settings', () => {
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
      assert.propertyVal(mobileSettings, key, value, `Should have default ${key} setting`);
    });
  });

  context('getEditorSettings', () => {
    it('Override defaults plugins', () => {
      const settings = EditorSettings.getEditorSettings(
        hook.editor(),
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

      assert.equal(settings.id, 'id', 'Should have the specified id');
      assert.equal(settings.document_base_url, 'documentBaseUrl', 'Should have the specified documentBaseUrl');
      assert.equal(settings.userSetting, 'b', 'Should have the specified userSetting');
      assert.isTrue(settings.validate, 'Should have the forced validate setting');
      assert.equal(settings.theme, isPhone ? 'mobile' : 'silver', 'Should have the default theme');
      assert.equal(settings.plugins, isPhone ? '' : 'a', 'Should have the specified default plugin');
      assert.equal(settings.defaultSetting, 'a', 'Should have the default setting');
    });

    it('Override defaults with forced_plugins using arrays', () => {
      const defaultSettings = {
        forced_plugins: [ 'a', 'b' ]
      };

      const userSettings = {
        plugins: [ 'c', 'd' ]
      };

      const settings = EditorSettings.getEditorSettings(hook.editor(), 'id', 'documentBaseUrl', defaultSettings, userSettings);

      assert.equal(settings.plugins, isPhone ? 'a b' : 'a b c d', 'Should be both forced and user plugins');
    });

    it('Override defaults with forced_plugins using strings', () => {
      const defaultSettings = {
        forced_plugins: 'a b'
      };

      const userSettings = {
        plugins: 'c d'
      };

      const settings = EditorSettings.getEditorSettings(hook.editor(), 'id', 'documentBaseUrl', defaultSettings, userSettings);

      assert.equal(settings.plugins, isPhone ? 'a b' : 'a b c d', 'Should be both forced and user plugins');
    });

    it('Override defaults with forced_plugins using mixed types and spaces', () => {
      const defaultSettings = {
        forced_plugins: '  a   b'
      };

      const userSettings = {
        plugins: [ ' c ', '  d   e ' ]
      };

      const settings = EditorSettings.getEditorSettings(hook.editor(), 'id', 'documentBaseUrl', defaultSettings, userSettings);

      assert.equal(settings.plugins, isPhone ? 'a b' : 'a b c d e', 'Should be both forced and user plugins');
    });

    it('Override defaults with just default forced_plugins', () => {
      const defaultSettings = {
        forced_plugins: [ 'a', 'b' ]
      };

      const userSettings = {
      };

      const settings = EditorSettings.getEditorSettings(hook.editor(), 'id', 'documentBaseUrl', defaultSettings, userSettings);

      assert.equal(settings.plugins, 'a b', 'Should be just default plugins');
    });

    it('Override defaults with just user plugins', () => {
      const defaultSettings = {
      };

      const userSettings = {
        plugins: [ 'a', 'b' ]
      };

      const settings = EditorSettings.getEditorSettings(hook.editor(), 'id', 'documentBaseUrl', defaultSettings, userSettings);

      assert.equal(settings.plugins, isPhone ? '' : 'a b', 'Should be just user plugins');
    });

    it('Override defaults with forced_plugins should not be possible to override', () => {
      const defaultSettings = {
        forced_plugins: [ 'a', 'b' ]
      };

      const userSettings = {
        forced_plugins: [ 'a' ],
        plugins: [ 'c', 'd' ]
      };

      const settings = EditorSettings.getEditorSettings(hook.editor(), 'id', 'documentBaseUrl', defaultSettings, userSettings);

      assert.equal(settings.plugins, isPhone ? 'a b' : 'a b c d', 'Should be just forced and user plugins');
    });

    it('Getters for various setting types', () => {
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

      assert.isUndefined(EditorSettings.getParam(fakeEditor, 'non_existing'), 'Should be undefined for non existing setting');
      assert.isUndefined(EditorSettings.getParam(fakeEditor, 'non_existing'), 'Should be undefined for existing null setting');
      assert.isUndefined(EditorSettings.getParam(fakeEditor, 'undef'), 'Should be undefined for existing undefined setting');
      assert.equal(EditorSettings.getParam(fakeEditor, 'string'), 'a', 'Should be some for existing string setting');
      assert.equal(EditorSettings.getParam(fakeEditor, 'number'), 1, 'Should be some for existing number setting');
      assert.isTrue(EditorSettings.getParam(fakeEditor, 'boolTrue'), 'Should be some for existing bool setting');
      assert.isFalse(EditorSettings.getParam(fakeEditor, 'boolFalse'), 'Should be some for existing bool setting');
      assert.isUndefined(EditorSettings.getParam(fakeEditor, 'non_existing', undefined, 'string'), 'Should be undefined for non existing setting');
      assert.equal(EditorSettings.getParam(fakeEditor, 'string', undefined, 'string'), 'a', 'Should be some for existing string setting');
      assert.isUndefined(EditorSettings.getParam(fakeEditor, 'number', undefined, 'string'), 'Should be undefined for existing number setting');
      assert.isUndefined(EditorSettings.getParam(fakeEditor, 'boolTrue', undefined, 'string'), 'Should be undefined for existing bool setting');
    });

    it('Mobile override', () => {
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

      assert.equal(EditorSettings.getParam(fakeEditor, 'settingA', false), isTouch, 'Should only have the mobile setting on touch');
      assert.equal(EditorSettings.getParam(fakeEditor, 'settingB', false), isTouch, 'Should have the expected mobile setting value on touch');
      assert.equal(EditorSettings.getParam(fakeEditor, 'settingB', true), isTouch, 'Should have the expected desktop setting on desktop');
    });
  });

  context('combineSettings', () => {
    it('Merged settings (desktop)', () => {
      assert.deepEqual(
        EditorSettings.combineSettings(false, false, { a: 1, b: 1, c: 1 }, { b: 2 }, { c: 3 }),
        { a: 1, b: 2, c: 3, validate: true, external_plugins: {}, plugins: '' },
        'Should have validate, forced and empty plugins in the merged settings'
      );
    });

    it('Merged settings forced_plugins in default override settings (desktop)', () => {
      assert.deepEqual(
        EditorSettings.combineSettings(false, false, {}, { forced_plugins: [ 'a' ] }, { plugins: [ 'b' ] }),
        { validate: true, external_plugins: {}, forced_plugins: [ 'a' ], plugins: 'a b' },
        'Should have plugins merged with forced plugins'
      );
    });

    it('Merged settings forced_plugins in default override settings (mobile)', () => {
      assert.deepEqual(
        EditorSettings.combineSettings(true, true, {}, { forced_plugins: [ 'a' ] }, { plugins: [ 'b' ] }),
        { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, forced_plugins: [ 'a' ], plugins: 'a b' },
        'Should be have plugins merged with forced plugins'
      );
    });

    it('Merged settings forced_plugins in default override settings with user mobile settings (desktop)', () => {
      assert.deepEqual(
        EditorSettings.combineSettings(false, false, {}, { forced_plugins: [ 'a' ] }, {
          plugins: [ 'b' ],
          mobile: { plugins: [ 'c' ], toolbar_sticky: true }
        }),
        { validate: true, external_plugins: {}, forced_plugins: [ 'a' ], plugins: 'a b' },
        'Should not have plugins merged with mobile plugins'
      );
    });

    it('Merged settings when theme is mobile, forced_plugins in default override settings with user mobile settings (mobile)', () => {
      assert.deepEqual(
        EditorSettings.combineSettings(true, true, {}, { forced_plugins: [ 'a' ] }, {
          plugins: [ 'b' ],
          mobile: { plugins: [ 'lists custom' ], theme: 'mobile', toolbar_sticky: true }
        }),
        {
          ...expectedPhoneDefaultSettings,
          validate: true,
          external_plugins: {},
          forced_plugins: [ 'a' ],
          plugins: 'a lists',
          theme: 'mobile',
          toolbar_sticky: true
        },
        'Should have forced_plugins merged with mobile plugins but only whitelisted user plugins'
      );
    });

    it('Merged settings when theme is silver, forced_plugins in default override settings with user mobile settings (mobile)', () => {
      assert.deepEqual(
        EditorSettings.combineSettings(true, true, {}, { forced_plugins: [ 'a' ] }, { plugins: [ 'b' ], mobile: { plugins: [ 'lists custom' ] }}),
        { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, forced_plugins: [ 'a' ], plugins: 'a lists custom' },
        'Should not merge forced_plugins with mobile plugins when theme is not mobile'
      );
    });

    it('Merged settings forced_plugins in default override forced_plugins in user settings', () => {
      assert.deepEqual(
        EditorSettings.combineSettings(false, false, {}, { forced_plugins: [ 'a' ] }, { forced_plugins: [ 'b' ] }),
        { validate: true, external_plugins: {}, forced_plugins: [ 'b' ], plugins: 'a' },
        'Should not have user forced plugins'
      );
    });

    it('Merged settings when theme is mobile, on a mobile device', () => {
      assert.deepEqual(
        EditorSettings.combineSettings(true, true, {}, {}, { mobile: { theme: 'mobile' }, plugins: [ 'lists', 'b', 'autolink' ] }),
        { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, plugins: 'lists autolink', theme: 'mobile' },
        'Should fallback to filtered white listed. settings.plugins'
      );
    });

    it('Merged settings when mobile.plugins is undefined, on a mobile device', () => {
      assert.deepEqual(
        EditorSettings.combineSettings(true, true, {}, {}, { theme: 'silver', plugins: [ 'lists', 'b', 'autolink' ], mobile: {}}),
        { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, plugins: 'lists b autolink', theme: 'silver' },
        'Should use settings.plugins when mobile theme is not set'
      );
    });

    it('Merged settings when mobile.plugins is undefined, legacy mobile theme and on a mobile device', () => {
      assert.deepEqual(
        EditorSettings.combineSettings(true, true, {}, {}, { theme: 'silver', plugins: [ 'lists', 'b', 'autolink' ], mobile: { theme: 'mobile' }}),
        { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, plugins: 'lists autolink', theme: 'mobile' },
        'Should fallback to filtered white listed. settings.plugins'
      );
    });

    it('Merged settings with empty mobile.plugins="" on mobile', () => {
      assert.deepEqual(
        EditorSettings.combineSettings(true, true, {}, {}, { mobile: { plugins: '' }}),
        { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, plugins: '' },
        'Should not have any plugins when mobile.plugins is explicitly empty'
      );
    });

    it('Merged settings with defined mobile.plugins', () => {
      assert.deepEqual(
        EditorSettings.combineSettings(true, true, {}, {}, { mobile: { plugins: [ 'lists', 'autolink', 'foo', 'bar' ] }}),
        { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, plugins: 'lists autolink foo bar' },
        'Should allow all plugins'
      );
    });

    it('Merged settings with defined mobile.plugins and legacy mobile theme', () => {
      assert.deepEqual(
        EditorSettings.combineSettings(true, true, {}, {}, { mobile: { theme: 'mobile', plugins: [ 'lists', 'autolink', 'foo', 'bar' ] }}),
        { ...expectedPhoneDefaultSettings, validate: true, external_plugins: {}, plugins: 'lists autolink', theme: 'mobile' },
        'Should fallback to filtered white listed'
      );
    });

    it('Merged settings with mobile.theme silver and mobile.plugins', () => {
      assert.deepEqual(
        EditorSettings.combineSettings(true, true, {}, {}, {
          theme: 'test',
          mobile: { plugins: [ 'lists', 'autolink', 'foo', 'bar' ], theme: 'silver' }
        }),
        { ...expectedPhoneDefaultSettings, validate: true, theme: 'silver', external_plugins: {}, plugins: 'lists autolink foo bar' },
        'Should allow all mobile plugin'
      );
    });

    it('Merged settings with mobile.theme silver and mobile.plugins on Desktop', () => {
      assert.deepEqual(
        EditorSettings.combineSettings(false, false, {}, {}, {
          theme: 'silver',
          plugins: [ 'aa', 'bb', 'cc' ],
          mobile: { plugins: [ 'lists', 'autolink', 'foo', 'bar' ], theme: 'silver' }
        }),
        { validate: true, theme: 'silver', external_plugins: {}, plugins: 'aa bb cc' },
        'Should respect the desktop settings'
      );
    });
  });

  context('getParam', () => {
    it('getParam hash (legacy)', () => {
      const editor = new Editor('id', {
        hash1: 'a,b,c',
        hash2: 'a',
        hash3: 'a=b',
        hash4: 'a=b;c=d,e',
        hash5: 'a=b,c=d'
      }, EditorManager);

      assert.deepEqual(EditorSettings.getParam(editor, 'hash1', {}, 'hash'), { a: 'a', b: 'b', c: 'c' }, 'Should be expected object');
      assert.deepEqual(EditorSettings.getParam(editor, 'hash2', {}, 'hash'), { a: 'a' }, 'Should be expected object');
      assert.deepEqual(EditorSettings.getParam(editor, 'hash3', {}, 'hash'), { a: 'b' }, 'Should be expected object');
      assert.deepEqual(EditorSettings.getParam(editor, 'hash4', {}, 'hash'), { a: 'b', c: 'd,e' }, 'Should be expected object');
      assert.deepEqual(EditorSettings.getParam(editor, 'hash5', {}, 'hash'), { a: 'b', c: 'd' }, 'Should be expected object');
      assert.deepEqual(EditorSettings.getParam(editor, 'hash_undefined', { b: 2 }, 'hash'), { b: 2 }, 'Should be expected default object');
    });

    it('getParam primary types', () => {
      const editor = new Editor('id', {
        bool: true,
        str: 'a',
        num: 2,
        obj: { a: 1 },
        arr: [ 'a' ],
        fun: Fun.noop,
        strArr: [ 'a', 'b' ],
        mixedArr: [ 'a', 3 ]
      }, EditorManager);

      assert.isTrue(EditorSettings.getParam(editor, 'bool', false, 'boolean'), 'Should be expected bool');
      assert.equal(EditorSettings.getParam(editor, 'str', 'x', 'string'), 'a', 'Should be expected string');
      assert.equal(EditorSettings.getParam(editor, 'num', 1, 'number'), 2, 'Should be expected number');
      assert.deepEqual(EditorSettings.getParam(editor, 'obj', {}, 'object'), { a: 1 }, 'Should be expected object');
      assert.deepEqual(EditorSettings.getParam(editor, 'arr', [], 'array'), [ 'a' ], 'Should be expected array');
      assert.equal(typeof EditorSettings.getParam(editor, 'fun', null, 'function'), 'function', 'Should be expected function');

      // Defaults/fallbacks
      assert.isFalse(EditorSettings.getParam(editor, 'bool_undefined', false, 'boolean'), 'Should be expected default bool');
      assert.equal(EditorSettings.getParam(editor, 'str_undefined', 'x', 'string'), 'x', 'Should be expected default string');
      assert.equal(EditorSettings.getParam(editor, 'num_undefined', 1, 'number'), 1, 'Should be expected default number');
      assert.deepEqual(EditorSettings.getParam(editor, 'obj_undefined', {}, 'object'), {}, 'Should be expected default object');
      assert.deepEqual(EditorSettings.getParam(editor, 'arr_undefined', [], 'array'), [], 'Should be expected default array');
      assert.isNull(EditorSettings.getParam(editor, 'fun_undefined', null, 'function'), 'Should be expected default function');
      assert.deepEqual(EditorSettings.getParam(editor, 'strArr', [ 'x' ], 'string[]'), [ 'a', 'b' ], 'Should be expected string array');
      assert.deepEqual(EditorSettings.getParam(editor, 'mixedArr', [ 'x' ], 'string[]'), [ 'x' ], 'Should be expected default array on mixed types');
      assert.deepEqual(EditorSettings.getParam(editor, 'bool', [ 'x' ], 'string[]'), [ 'x' ], 'Should be expected default array on boolean');
    });
  });
});
