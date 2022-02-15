import { context, describe, it } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { assert } from 'chai';

import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
import * as NormalizeOptions from 'tinymce/core/options/NormalizeOptions';

describe('browser.tinymce.core.options.NormalizeOptionsTest', () => {
  const expectedMobileDefaultSettings: RawEditorOptions = {
    table_grid: false,
    object_resizing: false,
    resize: false,
    toolbar_mode: 'scrolling',
    toolbar_sticky: false
  };

  const expectedPhoneDefaultSettings: RawEditorOptions = {
    ...expectedMobileDefaultSettings,
    menubar: false
  };

  it('default tablet settings', () => {
    const defaultSettings = NormalizeOptions.getMobileOverrideOptions({}, false);
    Obj.each(expectedMobileDefaultSettings, (value, key) => {
      assert.propertyVal(defaultSettings, key, value, `Should have default ${key} setting`);
    });
    assert.notProperty(defaultSettings, 'menubar', 'Should not have menubar setting');
  });

  it('default phone settings', () => {
    const defaultSettings = NormalizeOptions.getMobileOverrideOptions({}, true);
    Obj.each(expectedPhoneDefaultSettings, (value, key) => {
      assert.propertyVal(defaultSettings, key, value, `Should have default ${key} setting`);
    });
  });

  it('desktop settings should not override mobile default settings', () => {
    const settings: RawEditorOptions = {
      toolbar_mode: 'sliding',
      table_grid: true,
      object_resizing: true,
      toolbar_sticky: true,
      resize: 'both',
      menubar: true
    };

    const mobileSettings = NormalizeOptions.combineOptions(true, true, {}, {}, settings);
    Obj.each(expectedPhoneDefaultSettings, (value, key) => {
      assert.propertyVal(mobileSettings, key, value, `Should have default ${key} setting`);
    });
  });

  context('normaliseOptions', () => {
    it('Override defaults plugins', () => {
      const settings = NormalizeOptions.normalizeOptions(
        {
          defaultSetting: 'a',
          plugins: [ 'a' ]
        },
        {
          validate: false,
          userSetting: 'b'
        }
      );

      assert.equal(settings.userSetting, 'b', 'Should have the specified userSetting');
      assert.deepEqual(settings.plugins, [ 'a' ], 'Should have the specified default plugin');
      assert.equal(settings.defaultSetting, 'a', 'Should have the default setting');
    });

    it('Override defaults with forced_plugins using arrays', () => {
      const defaultSettings = {
        forced_plugins: [ 'a', 'b' ]
      };

      const userSettings = {
        plugins: [ 'c', 'd' ]
      };

      const settings = NormalizeOptions.normalizeOptions(defaultSettings, userSettings);

      assert.deepEqual(settings.plugins, [ 'a', 'b', 'c', 'd' ], 'Should be both forced and user plugins');
    });

    it('Override defaults with forced_plugins using strings with spaces', () => {
      const defaultSettings = {
        forced_plugins: '  a   b'
      };

      const userSettings = {
        plugins: ' c d '
      };

      const settings = NormalizeOptions.normalizeOptions(defaultSettings, userSettings);

      assert.deepEqual(settings.plugins, [ 'a', 'b', 'c', 'd' ], 'Should be both forced and user plugins');
    });

    it('Override defaults with forced_plugins using strings with commas', () => {
      const defaultSettings = {
        forced_plugins: 'a,b'
      };

      const userSettings = {
        plugins: ' c, d, e '
      };

      const settings = NormalizeOptions.normalizeOptions(defaultSettings, userSettings);

      assert.deepEqual(settings.plugins, [ 'a', 'b', 'c', 'd', 'e' ], 'Should be both forced and user plugins');
    });

    it('Override defaults with just default forced_plugins', () => {
      const defaultSettings = {
        forced_plugins: [ 'a', 'b' ]
      };

      const userSettings = {
      };

      const settings = NormalizeOptions.normalizeOptions(defaultSettings, userSettings);

      assert.deepEqual(settings.plugins, [ 'a', 'b' ], 'Should be just default plugins');
    });

    it('Override defaults with just user plugins', () => {
      const defaultSettings = {
      };

      const userSettings = {
        plugins: [ 'a', 'b' ]
      };

      const settings = NormalizeOptions.normalizeOptions(defaultSettings, userSettings);

      assert.deepEqual(settings.plugins, [ 'a', 'b' ], 'Should be just user plugins');
    });

    it('Override defaults with forced_plugins should not be possible to override', () => {
      const defaultSettings = {
        forced_plugins: [ 'a', 'b' ]
      };

      const userSettings = {
        forced_plugins: [ 'a' ],
        plugins: [ 'c', 'd' ]
      };

      const settings = NormalizeOptions.normalizeOptions(defaultSettings, userSettings);

      assert.deepEqual(settings.plugins, [ 'a', 'b', 'c', 'd' ], 'Should be just forced and user plugins');
    });
  });

  context('combineSettings', () => {
    it('Merged settings (desktop)', () => {
      assert.deepEqual(
        NormalizeOptions.combineOptions(false, false, { a: 1, b: 1, c: 1 }, { b: 2 }, { c: 3 }),
        { a: 1, b: 2, c: 3, external_plugins: {}, forced_plugins: [], plugins: [] },
        'Should have validate, forced and empty plugins in the merged settings'
      );
    });

    it('Merged settings forced_plugins in default override settings (desktop)', () => {
      assert.deepEqual(
        NormalizeOptions.combineOptions(false, false, {}, { forced_plugins: [ 'a' ] }, { plugins: [ 'b' ] }),
        { external_plugins: {}, forced_plugins: [ 'a' ], plugins: [ 'a', 'b' ] },
        'Should have plugins merged with forced plugins'
      );
    });

    it('Merged settings forced_plugins in default override settings (mobile)', () => {
      assert.deepEqual(
        NormalizeOptions.combineOptions(true, true, {}, { forced_plugins: [ 'a' ] }, { plugins: [ 'b' ] }),
        { ...expectedPhoneDefaultSettings, external_plugins: {}, forced_plugins: [ 'a' ], plugins: [ 'a', 'b' ] },
        'Should be have plugins merged with forced plugins'
      );
    });

    it('Merged settings forced_plugins in default override settings with user mobile settings (desktop)', () => {
      assert.deepEqual(
        NormalizeOptions.combineOptions(false, false, {}, { forced_plugins: [ 'a' ] }, {
          plugins: [ 'b' ],
          mobile: { plugins: [ 'c' ], toolbar_sticky: true }
        }),
        { external_plugins: {}, forced_plugins: [ 'a' ], plugins: [ 'a', 'b' ] },
        'Should not have plugins merged with mobile plugins'
      );
    });

    it('Merged settings when theme is silver, forced_plugins in default override settings with user mobile settings (mobile)', () => {
      assert.deepEqual(
        NormalizeOptions.combineOptions(true, true, {}, { forced_plugins: [ 'a' ] }, { plugins: [ 'b' ], mobile: { plugins: [ 'lists', 'custom' ] }}),
        { ...expectedPhoneDefaultSettings, external_plugins: {}, forced_plugins: [ 'a' ], plugins: [ 'a', 'lists', 'custom' ] },
        'Should not merge forced_plugins with mobile plugins when theme is not mobile'
      );
    });

    it('Merged settings forced_plugins in default override forced_plugins in user settings', () => {
      assert.deepEqual(
        NormalizeOptions.combineOptions(false, false, {}, { forced_plugins: [ 'a' ] }, { forced_plugins: [ 'b' ] }),
        { external_plugins: {}, forced_plugins: [ 'a' ], plugins: [ 'a' ] },
        'Should not have user forced plugins'
      );
    });

    it('Merged settings when mobile.plugins is undefined, on a mobile device', () => {
      assert.deepEqual(
        NormalizeOptions.combineOptions(true, true, {}, {}, { theme: 'silver', plugins: [ 'lists', 'b', 'autolink' ], mobile: {}}),
        { ...expectedPhoneDefaultSettings, external_plugins: {}, forced_plugins: [], plugins: [ 'lists', 'b', 'autolink' ], theme: 'silver' },
        'Should use settings.plugins when mobile theme is not set'
      );
    });

    it('Merged settings with empty mobile.plugins="" on mobile', () => {
      assert.deepEqual(
        NormalizeOptions.combineOptions(true, true, {}, {}, { mobile: { plugins: '' }}),
        { ...expectedPhoneDefaultSettings, external_plugins: {}, forced_plugins: [], plugins: [] },
        'Should not have any plugins when mobile.plugins is explicitly empty'
      );
    });

    it('Merged settings with defined mobile.plugins', () => {
      assert.deepEqual(
        NormalizeOptions.combineOptions(true, true, {}, {}, { mobile: { plugins: [ 'lists', 'autolink', 'foo', 'bar' ] }}),
        { ...expectedPhoneDefaultSettings, external_plugins: {}, forced_plugins: [], plugins: [ 'lists', 'autolink', 'foo', 'bar' ] },
        'Should allow all plugins'
      );
    });

    it('Merged settings with mobile.theme silver and mobile.plugins', () => {
      assert.deepEqual(
        NormalizeOptions.combineOptions(true, true, {}, {}, {
          theme: 'test',
          mobile: { plugins: [ 'lists', 'autolink', 'foo', 'bar' ], theme: 'silver' }
        }),
        { ...expectedPhoneDefaultSettings, theme: 'silver', external_plugins: {}, forced_plugins: [], plugins: [ 'lists', 'autolink', 'foo', 'bar' ] },
        'Should allow all mobile plugin'
      );
    });

    it('Merged settings with mobile.theme silver and mobile.plugins on Desktop', () => {
      assert.deepEqual(
        NormalizeOptions.combineOptions(false, false, {}, {}, {
          theme: 'silver',
          plugins: [ 'aa', 'bb', 'cc' ],
          mobile: { plugins: [ 'lists', 'autolink', 'foo', 'bar' ], theme: 'silver' }
        }),
        { theme: 'silver', external_plugins: {}, forced_plugins: [], plugins: [ 'aa', 'bb', 'cc' ] },
        'Should respect the desktop settings'
      );
    });
  });
});
