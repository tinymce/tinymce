import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { LegacyUnit } from '@ephox/mcagar';
import AddOnManager from 'tinymce/core/api/AddOnManager';
import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';
import PluginManager from 'tinymce/core/api/PluginManager';
import I18n from 'tinymce/core/api/util/I18n';

UnitTest.asynctest('browser.tinymce.core.AddOnManagerTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();
  let languagePackUrl;

  const patch = (proto, name, patchFunc) => {
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

    proto[name] = (...args: any[]) => {
      args.unshift(originalFunc);
      return patchFunc.apply(this, args);
    };
  };

  const unpatch = (proto, name?) => {
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

  const getLanguagePackUrl = (code, languages?) => {
    languagePackUrl = null;
    I18n.setCode(code);
    PluginManager.requireLangPack('plugin', languages);
    return languagePackUrl;
  };

  suite.test('requireLangPack', () => {
    // requiring a language pack waits for the plugin to be loaded
    LegacyUnit.strictEqual(getLanguagePackUrl('sv', 'sv'), null);

    AddOnManager.PluginManager.load('plugin', '/root/plugin.js');

    LegacyUnit.equal(getLanguagePackUrl('sv_SE'), '/root/langs/sv_SE.js');
    LegacyUnit.equal(getLanguagePackUrl('sv_SE', 'sv_SE,en_US'), '/root/langs/sv_SE.js');
    LegacyUnit.equal(getLanguagePackUrl('sv'), '/root/langs/sv.js');
    LegacyUnit.equal(getLanguagePackUrl('sv', 'sv'), '/root/langs/sv.js');
    LegacyUnit.equal(getLanguagePackUrl('sv', 'sv,en,us'), '/root/langs/sv.js');
    LegacyUnit.equal(getLanguagePackUrl('sv', 'en,sv,us'), '/root/langs/sv.js');
    LegacyUnit.equal(getLanguagePackUrl('sv', 'en,us,sv'), '/root/langs/sv.js');
    LegacyUnit.strictEqual(getLanguagePackUrl('sv_SE', 'sv,en,us'), null);
    LegacyUnit.strictEqual(getLanguagePackUrl('sv', 'en,us'), null);

    AddOnManager.languageLoad = false;
    LegacyUnit.strictEqual(getLanguagePackUrl('sv', 'sv'), null);
  });

  patch(ScriptLoader.ScriptLoader, 'add', (origFunc, url, scriptSuccess) => {
    languagePackUrl = url;
    if (scriptSuccess) {
      scriptSuccess();
    }
  });

  Pipeline.async({}, suite.toSteps({}), () => {
    unpatch(ScriptLoader.ScriptLoader);
    success();
  }, failure);
});
