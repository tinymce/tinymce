asynctest(
  'browser.tinymce.core.EditorManagerTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'global!document',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.ScriptLoader',
    'tinymce.core.Editor',
    'tinymce.core.EditorManager',
    'tinymce.core.PluginManager',
    'tinymce.core.test.ViewBlock',
    'tinymce.core.ThemeManager',
    'tinymce.core.util.Delay',
    'tinymce.core.util.Tools',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, LegacyUnit, document, DOMUtils, ScriptLoader, Editor, EditorManager, PluginManager, ViewBlock, ThemeManager, Delay, Tools, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var viewBlock = new ViewBlock();

    Theme();

    var teardown = function (done) {
      Delay.setTimeout(function () {
        EditorManager.remove();
        done();
      }, 0);
    };

    suite.asyncTest('get', function (_, done) {
      viewBlock.update('<textarea class="tinymce"></textarea>');
      EditorManager.init({
        selector: "textarea.tinymce",
        skin_url: '/project/src/skins/lightgray/dist/lightgray',
        init_instance_callback: function (editor1) {
          LegacyUnit.equal(EditorManager.get().length, 1);
          LegacyUnit.equal(EditorManager.get(0) === EditorManager.activeEditor, true);
          LegacyUnit.equal(EditorManager.get(1), null);
          LegacyUnit.equal(EditorManager.get("noid"), null);
          LegacyUnit.equal(EditorManager.get(undefined), null);
          LegacyUnit.equal(EditorManager.get()[0] === EditorManager.activeEditor, true);
          LegacyUnit.equal(EditorManager.get(EditorManager.activeEditor.id) === EditorManager.activeEditor, true);

          // Trigger save
          var saveCount = 0;

          editor1.on('SaveContent', function () {
            saveCount++;
          });

          EditorManager.triggerSave();
          LegacyUnit.equal(saveCount, 1);

          // Re-init on same id
          EditorManager.init({
            selector: "#" + EditorManager.activeEditor.id,
            skin_url: '/project/src/skins/lightgray/dist/lightgray'
          });

          LegacyUnit.equal(EditorManager.get().length, 1);

          teardown(done);
        }
      });
    });

    suite.test('addI18n/translate', function () {
      EditorManager.addI18n('en', {
        'from': 'to'
      });

      LegacyUnit.equal(EditorManager.translate('from'), 'to');
    });

    suite.asyncTest('Externally destroyed editor', function (_, done) {
      EditorManager.remove();

      EditorManager.init({
        selector: "textarea",
        skin_url: '/project/src/skins/lightgray/dist/lightgray',
        init_instance_callback: function (editor1) {
          Delay.setTimeout(function () {
            // Destroy the editor by setting innerHTML common ajax pattern
            viewBlock.update('<textarea id="' + editor1.id + '"></textarea>');

            // Re-init the editor will have the same id
            EditorManager.init({
              selector: "textarea",
              skin_url: '/project/src/skins/lightgray/dist/lightgray',
              init_instance_callback: function (editor2) {
                LegacyUnit.equal(EditorManager.get().length, 1);
                LegacyUnit.equal(editor1.id, editor2.id);
                LegacyUnit.equal(editor1.destroyed, 1, "First editor instance should be destroyed");

                teardown(done);
              }
            });
          }, 0);
        }
      });
    });

    suite.test('overrideDefaults', function () {
      var oldBaseURI, oldBaseUrl, oldSuffix;

      oldBaseURI = EditorManager.baseURI;
      oldBaseUrl = EditorManager.baseURL;
      oldSuffix = EditorManager.suffix;

      EditorManager.overrideDefaults({
        test: 42,
        base_url: "http://www.EditorManager.com/base/",
        suffix: "x",
        external_plugins: {
          "plugina": "//domain/plugina.js",
          "pluginb": "//domain/pluginb.js"
        },
        plugin_base_urls: {
          testplugin: 'http://custom.ephox.com/dir/testplugin'
        }
      });

      LegacyUnit.strictEqual(EditorManager.baseURI.path, "/base");
      LegacyUnit.strictEqual(EditorManager.baseURL, "http://www.EditorManager.com/base");
      LegacyUnit.strictEqual(EditorManager.suffix, "x");
      LegacyUnit.strictEqual(new Editor('ed1', {}, EditorManager).settings.test, 42);
      LegacyUnit.strictEqual(PluginManager.urls.testplugin, 'http://custom.ephox.com/dir/testplugin');

      LegacyUnit.equal(new Editor('ed2', {
        skin_url: '/project/src/skins/lightgray/dist/lightgray',
        external_plugins: {
          "plugina": "//domain/plugina2.js",
          "pluginc": "//domain/pluginc.js"
        },
        plugin_base_urls: {
          testplugin: 'http://custom.ephox.com/dir/testplugin'
        }
      }, EditorManager).settings.external_plugins, {
        "plugina": "//domain/plugina2.js",
        "pluginb": "//domain/pluginb.js",
        "pluginc": "//domain/pluginc.js"
      });

      LegacyUnit.equal(new Editor('ed3', {
        skin_url: '/project/src/skins/lightgray/dist/lightgray'
      }, EditorManager).settings.external_plugins, {
        "plugina": "//domain/plugina.js",
        "pluginb": "//domain/pluginb.js"
      });

      EditorManager.baseURI = oldBaseURI;
      EditorManager.baseURL = oldBaseUrl;
      EditorManager.suffix = oldSuffix;

      EditorManager.overrideDefaults({});
    });

    suite.test('Init inline editor on invalid targets', function () {
      var invalidNames;

      invalidNames = (
        'area base basefont br col frame hr img input isindex link meta param embed source wbr track ' +
        'colgroup option tbody tfoot thead tr script noscript style textarea video audio iframe object menu'
      );

      EditorManager.remove();

      Tools.each(invalidNames.split(' '), function (invalidName) {
        var elm = DOMUtils.DOM.add(document.body, invalidName, { 'class': 'targetEditor' }, null);

        EditorManager.init({
          selector: invalidName + '.targetEditor',
          skin_url: '/project/src/skins/lightgray/dist/lightgray',
          inline: true
        });

        LegacyUnit.strictEqual(EditorManager.get().length, 0, 'Should not have created an editor');
        DOMUtils.DOM.remove(elm);
      });
    });

    viewBlock.attach();
    Pipeline.async({}, suite.toSteps({}), function () {
      EditorManager.remove();
      viewBlock.detach();
      success();
    }, failure);
  }
);
