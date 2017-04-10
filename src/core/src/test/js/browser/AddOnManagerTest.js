asynctest(
  'browser.tinymce.core.AddOnManagerTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.core.AddOnManager',
    'tinymce.core.dom.ScriptLoader',
    'tinymce.core.PluginManager'
  ],
  function (Pipeline, LegacyUnit, AddOnManager, ScriptLoader, PluginManager) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var languagePackUrl;

    var patch = function (proto, name, patchFunc) {
      var originalFunc = proto[name];
      var originalFuncs = proto.__originalFuncs;

      if (!originalFuncs) {
        proto.__originalFuncs = originalFuncs = {};
      }

      if (!originalFuncs[name]) {
        originalFuncs[name] = originalFunc;
      } else {
        originalFunc = originalFuncs[name];
      }

      proto[name] = function () {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(originalFunc);
        return patchFunc.apply(this, args);
      };
    };

    var unpatch = function (proto, name) {
      var originalFuncs = proto.__originalFuncs;

      if (!originalFuncs) {
        return;
      }

      if (name) {
        proto[name] = originalFuncs[name];
        delete originalFuncs[name];
      } else {
        for (var key in originalFuncs) {
          proto[key] = originalFuncs[key];
        }

        delete proto.__originalFuncs;
      }
    };

    var getLanguagePackUrl = function (language, languages) {
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
  }
);
