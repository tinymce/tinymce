import { after, afterEach, before, describe, it } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { Remove, Selectors } from '@ephox/sugar';
import { assert } from 'chai';
import 'tinymce';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import PluginManager from 'tinymce/core/api/PluginManager';
import Tools from 'tinymce/core/api/util/Tools';
import Model from 'tinymce/models/dom/Model';
import Theme from 'tinymce/themes/silver/Theme';

import * as UuidUtils from '../module/test/UuidUtils';
import * as ViewBlock from '../module/test/ViewBlock';

describe('browser.tinymce.core.EditorManagerTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  before(() => {
    Theme();
    Model();
    EditorManager._setBaseUrl('/project/tinymce/js/tinymce');
    // Check pageUid is defined before any editors are created
    UuidUtils.assertIsUuid(EditorManager.pageUid);
  });

  after(() => {
    EditorManager.remove();
  });

  afterEach((done) => {
    setTimeout(() => {
      EditorManager.remove();
      done();
    }, 0);
  });

  it('get', (done) => {
    viewBlock.update('<textarea class="tinymce"></textarea>');
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    EditorManager.init({
      selector: 'textarea.tinymce',
      license_key: 'gpl',
      init_instance_callback: (editor1) => {
        assert.lengthOf(EditorManager.get(), 1);
        assert.equal(EditorManager.get(0), EditorManager.activeEditor);
        assert.isNull(EditorManager.get(1));
        assert.isNull(EditorManager.get('noid'));
        assert.isNull(EditorManager.get(undefined as any));
        assert.equal(EditorManager.get()[0], EditorManager.activeEditor);
        assert.equal(EditorManager.get((EditorManager.activeEditor as Editor).id), EditorManager.activeEditor);
        assert.notEqual(EditorManager.get(), EditorManager.get());

        // Trigger save
        let saveCount = 0;

        editor1.on('SaveContent', () => {
          saveCount++;
        });

        EditorManager.triggerSave();
        assert.equal(saveCount, 1);

        // Re-init on same id
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        EditorManager.init({
          selector: '#' + (EditorManager.activeEditor as Editor).id,
          license_key: 'gpl',
        });

        assert.lengthOf(EditorManager.get(), 1);
        done();
      }
    });
  });

  it('addI18n/translate', () => {
    EditorManager.addI18n('en', {
      from: 'to'
    });

    assert.equal(EditorManager.translate('from'), 'to');
  });

  it('Do not reload language pack if it was already loaded or registered manually.', (done) => {
    const langCode = 'mce_lang';
    const langUrl = 'http://example.com/language/' + langCode + '.js';

    EditorManager.addI18n(langCode, {
      from: 'to'
    });

    viewBlock.update('<textarea></textarea>');

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    EditorManager.init({
      selector: 'textarea',
      language: langCode,
      license_key: 'gpl',
      language_url: langUrl,
      init_instance_callback: (_ed) => {
        const scripts = Tools.grep(document.getElementsByTagName('script'), (script) => {
          return script.src === langUrl;
        });

        assert.equal(scripts.length, 0);

        done();
      }
    });
  });

  it('Externally destroyed editor', (done) => {
    viewBlock.update('<textarea></textarea>');

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    EditorManager.init({
      selector: 'textarea',
      license_key: 'gpl',
      init_instance_callback: (editor1) => {
        setTimeout(() => {
          // Destroy the editor by setting innerHTML common ajax pattern
          viewBlock.update('<textarea id="' + editor1.id + '"></textarea>');

          // We need to remove the sink since it's added to the body
          Selectors.one('.tox-silver-sink').each(Remove.remove);

          // Re-init the editor will have the same id
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          EditorManager.init({
            selector: 'textarea',
            license_key: 'gpl',
            skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
            content_css: '/project/tinymce/js/tinymce/skins/content/default',
            init_instance_callback: (editor2) => {
              assert.lengthOf(EditorManager.get(), 1);
              assert.equal(editor1.id, editor2.id);
              assert.isTrue(editor1.destroyed, 'First editor instance should be destroyed');

              done();
            }
          });
        }, 0);
      }
    });
  });

  it('overrideDefaults', () => {
    const oldBaseURI = EditorManager.baseURI;
    const oldBaseUrl = EditorManager.baseURL;
    const oldSuffix = EditorManager.suffix;

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

    const editor = new Editor('ed1', {}, EditorManager);
    editor.options.register('test', { processor: 'number' });

    assert.strictEqual(EditorManager.baseURI.path, '/base');
    assert.strictEqual(EditorManager.baseURL, 'http://www.EditorManager.com/base');
    assert.strictEqual(EditorManager.suffix, 'x');
    assert.strictEqual(editor.options.get('test'), 42);
    assert.strictEqual(PluginManager.urls.testplugin, 'http://custom.ephox.com/dir/testplugin');

    assert.deepEqual(new Editor('ed2', {
      base_url: '/project/tinymce/js/tinymce',
      license_key: 'gpl',
      external_plugins: {
        plugina: '//domain/plugina2.js',
        pluginc: '//domain/pluginc.js'
      },
      plugin_base_urls: {
        testplugin: 'http://custom.ephox.com/dir/testplugin'
      }
    }, EditorManager).options.get('external_plugins'), {
      plugina: '//domain/plugina2.js',
      pluginb: '//domain/pluginb.js',
      pluginc: '//domain/pluginc.js'
    });

    assert.deepEqual(new Editor('ed3', {
      base_url: '/project/tinymce/js/tinymce',
      license_key: 'gpl',
    }, EditorManager).options.get('external_plugins'), {
      plugina: '//domain/plugina.js',
      pluginb: '//domain/pluginb.js'
    });

    EditorManager.baseURI = oldBaseURI;
    EditorManager.baseURL = oldBaseUrl;
    EditorManager.suffix = oldSuffix;

    EditorManager.overrideDefaults({});
  });

  it('Init inline editor on invalid targets', () => {
    const invalidNames = (
      'area base basefont br col frame hr img input isindex link meta param embed source wbr track ' +
      'colgroup option tbody tfoot thead tr script noscript style textarea video audio iframe object menu'
    );

    Tools.each(invalidNames.split(' '), (invalidName) => {
      const elm = DOMUtils.DOM.add(document.body, invalidName, { class: 'targetEditor' }, null);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      EditorManager.init({
        selector: invalidName + '.targetEditor',
        license_key: 'gpl',
        inline: true
      });

      assert.strictEqual(EditorManager.get().length, 0, 'Should not have created an editor');
      DOMUtils.DOM.remove(elm);
    });
  });

  it('TINY-12021: pageUid', async () => {
    const pageUid = EditorManager.pageUid;
    UuidUtils.assertIsUuid(pageUid);

    viewBlock.update('<textarea class="tinymce"></textarea><textarea class="tinymce"></textarea>');
    await EditorManager.init({
      selector: 'textarea.tinymce',
      license_key: 'gpl',
      setup: (editor) => {
        assert.equal(editor.editorManager.pageUid, pageUid);
      },
    });
  });

  it('TINY-12020: EditorManager should have correct locked properties', async () => {
    const lockedEditorManagerProperties = [ 'majorVersion', 'minorVersion', 'releaseDate', 'pageUid', '_addLicenseKeyManager' ] as const;
    const lockedPropertiesSet = new Set<string>(lockedEditorManagerProperties);

    const descriptors = Object.getOwnPropertyDescriptors(EditorManager);
    Obj.each(descriptors, (descriptor, key) => {
      if (lockedPropertiesSet.has(key)) {
        assert.isFalse(descriptor.configurable, `${key} should not be configurable`);
        assert.isFalse(descriptor.writable, `${key} should not be writable`);
        assert.isTrue(descriptor.enumerable, `${key} should be enumerable`);
      } else {
        assert.isTrue(descriptor.configurable, `${key} should be configurable`);
        assert.isTrue(descriptor.writable, `${key} should be writable`);
        assert.isTrue(descriptor.enumerable, `${key} should be enumerable`);
      }
    });

    for (const property of lockedEditorManagerProperties) {
      assert.throws(() => {
        (EditorManager[property] as any) = 'some_random_value';
      });
      assert.throws(() => {
        delete EditorManager[property];
      });
      assert.notStrictEqual(EditorManager[property], 'some_random_value');
    }
  });
});
