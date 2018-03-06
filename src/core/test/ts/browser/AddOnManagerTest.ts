import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import { AddOnManager } from 'tinymce/core/api/AddOnManager';
import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';
import PluginManager from 'tinymce/core/api/PluginManager';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.AddOnManagerTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  let languagePackUrl;

  const patch = function (proto, name, patchFunc) {
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

    proto[name] = function () {
      const args = Array.prototype.slice.call(arguments);
      args.unshift(originalFunc);
      return patchFunc.apply(this, args);
    };
  };

  const unpatch = function (proto, name?) {
    const originalFuncs = proto.__originalFuncs;

    if (!originalFuncs) {
      return;
    }

    if (name) {
      proto[name] = originalFuncs[name];
      delete originalFuncs[name];
    } else {
      for (const key in originalFuncs) {
        proto[key] = originalFuncs[key];
      }

      delete proto.__originalFuncs;
    }
  };

  const getLanguagePackUrl = function (language, languages?) {
    languagePackUrl = null;
    AddOnManager.language = language;
    PluginManager.requireLangPack('plugin', languages);
    return languagePackUrl;
  };

  suite.test('requireLangPack', function () {
    AddOnManager.PluginManager.urls.plugin = '/root';

    LegacyUnit.equal(getLanguagePackUrl('sv_SE'), '/root/langs/sv_SE.js');
    LegacyUnit.equal(getLanguagePackUrl('sv_SE', 'sv,en,us'), '/root/langs/sv.js');
    LegacyUnit.equal(getLanguagePackUrl('sv_SE', 'sv_SE,en_US'), '/root/langs/sv_SE.js');
    LegacyUnit.equal(getLanguagePackUrl('sv'), '/root/langs/sv.js');
    LegacyUnit.equal(getLanguagePackUrl('sv', 'sv'), '/root/langs/sv.js');
    LegacyUnit.equal(getLanguagePackUrl('sv', 'sv,en,us'), '/root/langs/sv.js');
    LegacyUnit.equal(getLanguagePackUrl('sv', 'en,sv,us'), '/root/langs/sv.js');
    LegacyUnit.equal(getLanguagePackUrl('sv', 'en,us,sv'), '/root/langs/sv.js');
    LegacyUnit.strictEqual(getLanguagePackUrl('sv', 'en,us'), null);
    LegacyUnit.strictEqual(getLanguagePackUrl(null, 'en,us'), null);
    LegacyUnit.strictEqual(getLanguagePackUrl(null), null);

    AddOnManager.languageLoad = false;
    LegacyUnit.strictEqual(getLanguagePackUrl('sv', 'sv'), null);
  });

  patch(ScriptLoader.ScriptLoader, 'add', function (origFunc, url) {
    languagePackUrl = url;
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
    unpatch(ScriptLoader.ScriptLoader);
  }, failure);
});
