import { after, afterEach, before, describe, it } from '@ephox/bedrock-client';
import { Remove, Selectors } from '@ephox/sugar';
import { assert } from 'chai';
import 'tinymce';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import PluginManager from 'tinymce/core/api/PluginManager';
import Tools from 'tinymce/core/api/util/Tools';

import * as ViewBlock from '../module/test/ViewBlock';

describe('browser.tinymce.core.EditorManagerTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  before(() => {
    EditorManager._setBaseUrl('/project/tinymce/js/tinymce');
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
      base_url: '/project/tinymce/js/tinymce'
    }, EditorManager).options.get('external_plugins'), {
      plugina: '//domain/plugina.js',
      pluginb: '//domain/pluginb.js'
    });

    EditorManager.baseURI = oldBaseURI;
    EditorManager.baseURL = oldBaseUrl;
    EditorManager.suffix = oldSuffix;

    EditorManager.overrideDefaults({});
  });

  it('TINY-12050: Should be possible to override and unset non cloud options by setting tinymce.defaultOptions', () => {
    EditorManager.overrideDefaults({
      some_option: 'bar'
    });

    EditorManager.defaultOptions = {
      some_new_option: 'bar'
    };

    const editor = new Editor('ed1', { }, EditorManager);

    editor.options.register('some_option', { processor: 'string' });
    editor.options.register('some_new_option', { processor: 'string' });

    assert.isFalse(editor.options.isSet('some_option'), 'some_option should not be set since it was removed by defaultOptions');
    assert.strictEqual(editor.options.get('some_new_option'), 'bar', 'some_new_option should be set since it was defined in defaultOptions');
  });

  it('TINY-12050: Should not be possible to unset cloud options by setting tinymce.defaultOptions', () => {
    EditorManager.overrideDefaults({
      api_key: '123',
      chiffer_foo: 'bar',
      fluffy_foo: 'bar',
      tiny_cloud_foo: 'bar',
      forced_plugins: [ 'foo' ]
    });

    EditorManager.defaultOptions = {};

    const editor = new Editor('ed1', { }, EditorManager);

    editor.options.register('chiffer_foo', { processor: 'string' });
    editor.options.register('fluffy_foo', { processor: 'string' });
    editor.options.register('tiny_cloud_foo', { processor: 'string' });

    assert.strictEqual(editor.options.get('api_key'), '123', 'api_key should be set to overrideDefaults value');
    assert.strictEqual(editor.options.get('tiny_cloud_foo'), 'bar', 'tiny_cloud_foo should be set to overrideDefaults value');
    assert.strictEqual(editor.options.get('chiffer_foo'), 'bar', 'chiffer_foo should be set to overrideDefaults value');
    assert.strictEqual(editor.options.get('fluffy_foo'), 'bar', 'fluffy_foo should be set to overrideDefaults value');
    assert.deepEqual(editor.options.get('forced_plugins'), [ 'foo' ], 'forced_plugins should be set overrideDefaults value');
  });

  it('TINY-12050: Should not be possible to unset cloud options by setting calling tinymce.overrideDefaults', () => {
    EditorManager.overrideDefaults({
      api_key: '123',
      chiffer_foo: 'bar',
      fluffy_foo: 'bar',
      tiny_cloud_foo: 'bar',
      forced_plugins: [ 'foo' ],
      service_message: 'bar'
    });

    EditorManager.overrideDefaults({ });

    const editor = new Editor('ed1', { }, EditorManager);

    editor.options.register('chiffer_foo', { processor: 'string' });
    editor.options.register('fluffy_foo', { processor: 'string' });
    editor.options.register('tiny_cloud_foo', { processor: 'string' });

    assert.strictEqual(editor.options.get('api_key'), '123', 'api_key should be set to overrideDefaults value');
    assert.strictEqual(editor.options.get('tiny_cloud_foo'), 'bar', 'tiny_cloud_foo should be set to overrideDefaults value');
    assert.strictEqual(editor.options.get('chiffer_foo'), 'bar', 'chiffer_foo should be set to overrideDefaults value');
    assert.strictEqual(editor.options.get('fluffy_foo'), 'bar', 'fluffy_foo should be set to overrideDefaults value');
    assert.deepEqual(editor.options.get('forced_plugins'), [ 'foo' ], 'forced_plugins should be set to overrideDefaults value');
    assert.strictEqual(editor.options.get('service_message'), 'bar', 'service_message should be set to overrideDefaults value');
  });

  it('TINY-12050: Should not be possible to alter cloud options by setting tinymce.defaultOptions', () => {
    EditorManager.overrideDefaults({
      api_key: '123',
      chiffer_foo: 'bar',
      fluffy_foo: 'bar',
      tiny_cloud_foo: 'bar',
      forced_plugins: [ 'foo' ],
      service_message: 'bar'
    });

    EditorManager.defaultOptions = {
      api_key: '1234',
      chiffer_foo: 'baz',
      fluffy_foo: 'baz',
      tiny_cloud_foo: 'baz',
      forced_plugins: [ 'foo', 'bar' ],
      service_message: 'foo'
    };

    const editor = new Editor('ed1', { }, EditorManager);

    editor.options.register('chiffer_foo', { processor: 'string' });
    editor.options.register('fluffy_foo', { processor: 'string' });
    editor.options.register('tiny_cloud_foo', { processor: 'string' });

    assert.strictEqual(editor.options.get('api_key'), '123', 'api_key should be set to overrideDefaults value');
    assert.strictEqual(editor.options.get('tiny_cloud_foo'), 'bar', 'tiny_cloud_foo should be set to overrideDefaults value');
    assert.strictEqual(editor.options.get('chiffer_foo'), 'bar', 'chiffer_foo should be set to overrideDefaults value');
    assert.strictEqual(editor.options.get('fluffy_foo'), 'bar', 'fluffy_foo should be set to overrideDefaults value');
    assert.deepEqual(editor.options.get('forced_plugins'), [ 'foo' ], 'forced_plugins should be set overrideDefaults value');
    assert.strictEqual(editor.options.get('service_message'), 'bar', 'service_message should be set to overrideDefaults value');
  });

  it('TINY-12050: Should be possible override options that are set with overrideDefaults with tinymce.init', () => {
    EditorManager.overrideDefaults({
      api_key: '123',
      chiffer_foo: 'bar',
      fluffy_foo: 'bar',
      tiny_cloud_foo: 'bar',
      other_default_option: 'bar',
      forced_plugins: [ 'foo' ],
      service_message: 'bar'
    });

    const editor = new Editor('ed1', {
      api_key: 'override',
      chiffer_foo: 'override',
      fluffy_foo: 'override',
      tiny_cloud_foo: 'override',
      other_option: 'bar',
      forced_plugins: [ 'foo', 'bar' ],
      service_message: 'override'
    }, EditorManager);

    editor.options.register('chiffer_foo', { processor: 'string' });
    editor.options.register('fluffy_foo', { processor: 'string' });
    editor.options.register('tiny_cloud_foo', { processor: 'string' });
    editor.options.register('other_default_option', { processor: 'string' });
    editor.options.register('other_option', { processor: 'string' });

    assert.strictEqual(editor.options.get('api_key'), 'override', 'api_key should be set to tinymce.init value');
    assert.strictEqual(editor.options.get('chiffer_foo'), 'override', 'chiffer_foo should be set to tinymce.init value');
    assert.strictEqual(editor.options.get('fluffy_foo'), 'override', 'fluffy_foo should be set to tinymce.init value');
    assert.strictEqual(editor.options.get('tiny_cloud_foo'), 'override', 'tiny_cloud_foo should be set to tinymce.init value');
    assert.strictEqual(editor.options.get('other_default_option'), 'bar', 'other_default_option should be set to overrideDefaults value');
    assert.strictEqual(editor.options.get('other_option'), 'bar', 'other_option should be set to tinymce.init value');
    assert.deepEqual(editor.options.get('forced_plugins'), [ 'foo' ], 'forced_plugins should be set to overrideDefaults value');
    assert.strictEqual(editor.options.get('service_message'), 'override', 'service_message should be set to tinymce.init value');
  });

  it('TINY-12050: Should be possible to set cloud options multiple times with tinymce.overrideDefaults', () => {
    EditorManager.overrideDefaults({
      api_key: '123',
      chiffer_foo: 'bar',
      fluffy_foo: 'bar',
      tiny_cloud_foo: 'bar',
      forced_plugins: [ 'foo' ],
      service_message: 'bar'
    });

    EditorManager.overrideDefaults({
      api_key: '1234',
      chiffer_foo: 'baz',
      fluffy_foo: 'baz',
      tiny_cloud_foo: 'baz',
      forced_plugins: [ 'foo', 'bar' ],
      service_message: 'foo'
    });

    const editor = new Editor('ed1', { }, EditorManager);

    editor.options.register('chiffer_foo', { processor: 'string' });
    editor.options.register('fluffy_foo', { processor: 'string' });
    editor.options.register('tiny_cloud_foo', { processor: 'string' });

    assert.strictEqual(editor.options.get('api_key'), '1234', 'api_key should be set to second call to overrideDefaults value');
    assert.strictEqual(editor.options.get('tiny_cloud_foo'), 'baz', 'tiny_cloud_foo should be set by second call overrideDefaults value');
    assert.strictEqual(editor.options.get('chiffer_foo'), 'baz', 'chiffer_foo should be set by second overrideDefaults value');
    assert.strictEqual(editor.options.get('fluffy_foo'), 'baz', 'fluffy_foo should be set by second overrideDefaults value');
    assert.deepEqual(editor.options.get('forced_plugins'), [ 'foo', 'bar' ], 'forced_plugins should be set by second call to overrideDefaults');
    assert.strictEqual(editor.options.get('service_message'), 'foo', 'service_message should be set by second overrideDefaults value');
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
        inline: true
      });

      assert.strictEqual(EditorManager.get().length, 0, 'Should not have created an editor');
      DOMUtils.DOM.remove(elm);
    });
  });
});
