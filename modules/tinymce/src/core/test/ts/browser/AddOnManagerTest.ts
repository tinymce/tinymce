import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { assert } from 'chai';

import AddOnManager from 'tinymce/core/api/AddOnManager';
import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';
import PluginManager from 'tinymce/core/api/PluginManager';
import I18n from 'tinymce/core/api/util/I18n';

const patch = <T extends ((...args: any[]) => any)>(proto: any, name: string, patchFunc: T): void => {
  let originalFunc = proto[name];
  let originalFuncs = proto.__originalFuncs;

  if (!originalFuncs) {
    proto.__originalFuncs = originalFuncs = {};
  }

  if (!originalFuncs[name]) {
    originalFuncs[name] = originalFunc;
  } else {
    originalFunc = originalFuncs[name];
  }

  proto[name] = (...args: Parameters<T>) => {
    args.unshift(originalFunc);
    return patchFunc.apply(this, args);
  };
};

const unpatch = (proto: any, name?: string): void => {
  const originalFuncs = proto.__originalFuncs;

  if (!originalFuncs) {
    return;
  }

  if (name) {
    proto[name] = originalFuncs[name];
    delete originalFuncs[name];
  } else {
    Obj.each(originalFuncs, (value, key) => {
      proto[key] = value;
    });

    delete proto.__originalFuncs;
  }
};

describe('browser.tinymce.core.AddOnManagerTest', () => {
  let languagePackUrl: string | null;

  const getLanguagePackUrl = (code: string, languages?: string) => {
    languagePackUrl = null;
    I18n.setCode(code);
    PluginManager.requireLangPack('plugin', languages);
    return languagePackUrl;
  };

  before(() => patch(ScriptLoader.ScriptLoader, 'add', (origFunc, url) => {
    languagePackUrl = url;
    return Promise.resolve();
  }));

  after(() => unpatch(ScriptLoader.ScriptLoader));

  context('requireLangPack', () => {
    it('requiring a language pack waits for the plugin to be loaded', () => {
      assert.isNull(getLanguagePackUrl('sv', 'sv'));
    });

    it('loading language packs works after loading the plugin', () => {
      AddOnManager.PluginManager.load('plugin', '/root/plugin.js');

      assert.equal(getLanguagePackUrl('sv_SE'), '/root/langs/sv_SE.js');
      assert.equal(getLanguagePackUrl('sv_SE', 'sv_SE,en_US'), '/root/langs/sv_SE.js');
      assert.equal(getLanguagePackUrl('sv'), '/root/langs/sv.js');
      assert.equal(getLanguagePackUrl('sv', 'sv'), '/root/langs/sv.js');
      assert.equal(getLanguagePackUrl('sv', 'sv,en,us'), '/root/langs/sv.js');
      assert.equal(getLanguagePackUrl('sv', 'en,sv,us'), '/root/langs/sv.js');
      assert.equal(getLanguagePackUrl('sv', 'en,us,sv'), '/root/langs/sv.js');
      assert.isNull(getLanguagePackUrl('sv_SE', 'sv,en,us'));
      assert.isNull(getLanguagePackUrl('sv', 'en,us'));
    });

    it(`language packs aren't loaded when languageLoad is false`, () => {
      AddOnManager.languageLoad = false;
      assert.isNull(getLanguagePackUrl('sv', 'sv'));
    });
  });
});
