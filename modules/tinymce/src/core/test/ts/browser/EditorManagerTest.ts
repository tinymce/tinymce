import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { LegacyUnit } from '@ephox/mcagar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import PluginManager from 'tinymce/core/api/PluginManager';
import ViewBlock from '../module/test/ViewBlock';
import Delay from 'tinymce/core/api/util/Delay';
import Tools from 'tinymce/core/api/util/Tools';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.EditorManagerTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  Theme();

  const teardown = function (done) {
    Delay.setTimeout(function () {
      EditorManager.remove();
      done();
    }, 0);
  };

  suite.asyncTest('get', function (_, done) {
    viewBlock.update('<textarea class="tinymce"></textarea>');
    EditorManager.init({
      selector: 'textarea.tinymce',
      skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
      content_css: '/project/tinymce/js/tinymce/skins/content/default',
      init_instance_callback (editor1) {
        LegacyUnit.equal(EditorManager.get().length, 1);
        LegacyUnit.equal(EditorManager.get(0) === EditorManager.activeEditor, true);
        LegacyUnit.equal(EditorManager.get(1), null);
        LegacyUnit.equal(EditorManager.get('noid'), null);
        LegacyUnit.equal(EditorManager.get(undefined), null);
        LegacyUnit.equal(EditorManager.get()[0] === EditorManager.activeEditor, true);
        LegacyUnit.equal(EditorManager.get(EditorManager.activeEditor.id) === EditorManager.activeEditor, true);
        LegacyUnit.equal(EditorManager.get() !== EditorManager.get(), true);

        // Trigger save
        let saveCount = 0;

        editor1.on('SaveContent', function () {
          saveCount++;
        });

        EditorManager.triggerSave();
        LegacyUnit.equal(saveCount, 1);

        // Re-init on same id
        EditorManager.init({
          selector: '#' + EditorManager.activeEditor.id,
          skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
          content_css: '/project/tinymce/js/tinymce/skins/content/default',
        });

        LegacyUnit.equal(EditorManager.get().length, 1);

        teardown(done);
      }
    });
  });

  suite.test('addI18n/translate', function () {
    EditorManager.addI18n('en', {
      from: 'to'
    });

    LegacyUnit.equal(EditorManager.translate('from'), 'to');
  });

  suite.asyncTest('Do not reload language pack if it was already loaded or registered manually.', function (_, done) {
    const langCode = 'mce_lang';
    const langUrl = 'http://example.com/language/' + langCode + '.js';

    EditorManager.addI18n(langCode, {
      from: 'to'
    });

    viewBlock.update('<textarea></textarea>');

    EditorManager.init({
      selector: 'textarea',
      skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
      content_css: '/project/tinymce/js/tinymce/skins/content/default',
      language: langCode,
      language_url: langUrl,
      init_instance_callback (ed) {
        const scripts = Tools.grep(document.getElementsByTagName('script'), function (script) {
          return script.src === langUrl;
        });

        LegacyUnit.equal(scripts.length, 0);

        teardown(done);
      }
    });
  });

  suite.asyncTest('Externally destroyed editor', function (_, done) {
    EditorManager.remove();

    EditorManager.init({
      selector: 'textarea',
      skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
      content_css: '/project/tinymce/js/tinymce/skins/content/default',
      init_instance_callback (editor1) {
        Delay.setTimeout(function () {
          // Destroy the editor by setting innerHTML common ajax pattern
          viewBlock.update('<textarea id="' + editor1.id + '"></textarea>');

          // Re-init the editor will have the same id
          EditorManager.init({
            selector: 'textarea',
            skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
            content_css: '/project/tinymce/js/tinymce/skins/content/default',
            init_instance_callback (editor2) {
              LegacyUnit.equal(EditorManager.get().length, 1);
              LegacyUnit.equal(editor1.id, editor2.id);
              LegacyUnit.equal(editor1.destroyed, true, 'First editor instance should be destroyed');

              teardown(done);
            }
          });
        }, 0);
      }
    });
  });

  suite.test('overrideDefaults', function () {
    let oldBaseURI, oldBaseUrl, oldSuffix;

    oldBaseURI = EditorManager.baseURI;
    oldBaseUrl = EditorManager.baseURL;
    oldSuffix = EditorManager.suffix;

    EditorManager.overrideDefaults({
      test: 42,
      base_url: 'http://www.EditorManager.com/base/',
      suffix: 'x',
      external_plugins: {
        plugina: '//domain/plugina.js',
        pluginb: '//domain/pluginb.js'
      },
      plugin_base_urls: {
        testplugin: 'http://custom.ephox.com/dir/testplugin'
      }
    });

    LegacyUnit.strictEqual(EditorManager.baseURI.path, '/base');
    LegacyUnit.strictEqual(EditorManager.baseURL, 'http://www.EditorManager.com/base');
    LegacyUnit.strictEqual(EditorManager.suffix, 'x');
    LegacyUnit.strictEqual(new Editor('ed1', {}, EditorManager).settings.test, 42);
    LegacyUnit.strictEqual(PluginManager.urls.testplugin, 'http://custom.ephox.com/dir/testplugin');

    LegacyUnit.equal(new Editor('ed2', {
      base_url: '/project/tinymce/js/tinymce',
      external_plugins: {
        plugina: '//domain/plugina2.js',
        pluginc: '//domain/pluginc.js'
      },
      plugin_base_urls: {
        testplugin: 'http://custom.ephox.com/dir/testplugin'
      }
    }, EditorManager).settings.external_plugins, {
      plugina: '//domain/plugina2.js',
      pluginb: '//domain/pluginb.js',
      pluginc: '//domain/pluginc.js'
    });

    LegacyUnit.equal(new Editor('ed3', {
      base_url: '/project/tinymce/js/tinymce'
    }, EditorManager).settings.external_plugins, {
      plugina: '//domain/plugina.js',
      pluginb: '//domain/pluginb.js'
    });

    EditorManager.baseURI = oldBaseURI;
    EditorManager.baseURL = oldBaseUrl;
    EditorManager.suffix = oldSuffix;

    EditorManager.overrideDefaults({});
  });

  suite.test('Init inline editor on invalid targets', function () {
    let invalidNames;

    invalidNames = (
      'area base basefont br col frame hr img input isindex link meta param embed source wbr track ' +
      'colgroup option tbody tfoot thead tr script noscript style textarea video audio iframe object menu'
    );

    EditorManager.remove();

    Tools.each(invalidNames.split(' '), function (invalidName) {
      const elm = DOMUtils.DOM.add(document.body, invalidName, { class: 'targetEditor' }, null);

      EditorManager.init({
        selector: invalidName + '.targetEditor',
        skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
        content_css: '/project/tinymce/js/tinymce/skins/content/default',
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
});
