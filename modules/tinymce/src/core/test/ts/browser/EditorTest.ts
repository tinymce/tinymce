import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Attribute, Class, SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import Env from 'tinymce/core/api/Env';
import PluginManager from 'tinymce/core/api/PluginManager';
import URI from 'tinymce/core/api/util/URI';
import Theme from 'tinymce/themes/silver/Theme';

import * as HtmlUtils from '../module/test/HtmlUtils';

describe('browser.tinymce.core.EditorTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    custom_elements: 'custom1,~custom2',
    extended_valid_elements: 'custom1,custom2,script[*]',
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  it('TBA: Event: change', () => {
    const editor = hook.editor();
    let level, lastLevel;

    editor.on('change', (e) => {
      level = e.level;
      lastLevel = e.lastLevel;
    });

    editor.setContent('');
    editor.insertContent('a');
    assert.equal(level.content.toLowerCase(), '<p>a</p>', 'Event: change');
    assert.equal(lastLevel.content, editor.undoManager.data[0].content, 'Event: change');

    editor.off('change');
  });

  it('TBA: Event: beforeExecCommand', () => {
    const editor = hook.editor();
    let cmd, ui, value;

    editor.on('BeforeExecCommand', (e) => {
      cmd = e.command;
      ui = e.ui;
      value = e.value;

      e.preventDefault();
    });

    editor.setContent('');
    editor.insertContent('a');
    assert.equal(editor.getContent(), '', 'BeforeExecCommand');
    assert.equal(cmd, 'mceInsertContent', 'BeforeExecCommand');
    assert.isFalse(ui, 'BeforeExecCommand');
    assert.equal(value, 'a', 'BeforeExecCommand');

    editor.off('BeforeExecCommand');
    editor.setContent('');
    editor.insertContent('a');
    assert.equal(editor.getContent(), '<p>a</p>', 'BeforeExecCommand');
  });

  it('TBA: urls - relativeURLs', () => {
    const editor = hook.editor();
    editor.settings.relative_urls = true;
    editor.documentBaseURI = new URI('http://www.site.com/dirA/dirB/dirC/');

    editor.setContent('<a href="test.html">test</a>');
    assert.equal(editor.getContent(), '<p><a href="test.html">test</a></p>', 'urls - relativeURLs');

    editor.setContent('<a href="../test.html">test</a>');
    assert.equal(editor.getContent(), '<p><a href="../test.html">test</a></p>', 'urls - relativeURLs');

    editor.setContent('<a href="test/test.html">test</a>');
    assert.equal(editor.getContent(), '<p><a href="test/test.html">test</a></p>', 'urls - relativeURLs');

    editor.setContent('<a href="/test.html">test</a>');
    assert.equal(editor.getContent(), '<p><a href="../../../test.html">test</a></p>', 'urls - relativeURLs');

    editor.setContent('<a href="http://www.somesite.com/test/file.htm">test</a>');
    assert.equal(editor.getContent(), '<p><a href="http://www.somesite.com/test/file.htm">test</a></p>', 'urls - relativeURLs');

    editor.setContent('<a href="//www.site.com/test/file.htm">test</a>');
    assert.equal(editor.getContent(), '<p><a href="../../../test/file.htm">test</a></p>', 'urls - relativeURLs');

    editor.setContent('<a href="//www.somesite.com/test/file.htm">test</a>');
    assert.equal(editor.getContent(), '<p><a href="//www.somesite.com/test/file.htm">test</a></p>', 'urls - relativeURLs');
  });

  it('TBA: urls - absoluteURLs', () => {
    const editor = hook.editor();
    editor.settings.relative_urls = false;
    editor.settings.remove_script_host = true;
    editor.documentBaseURI = new URI('http://www.site.com/dirA/dirB/dirC/');

    editor.setContent('<a href="test.html">test</a>');
    assert.equal(editor.getContent(), '<p><a href="/dirA/dirB/dirC/test.html">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<a href="../test.html">test</a>');
    assert.equal(editor.getContent(), '<p><a href="/dirA/dirB/test.html">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<a href="test/test.html">test</a>');
    assert.equal(editor.getContent(), '<p><a href="/dirA/dirB/dirC/test/test.html">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<a href="http://www.somesite.com/test/file.htm">test</a>');
    assert.equal(editor.getContent(), '<p><a href="http://www.somesite.com/test/file.htm">test</a></p>', 'urls - absoluteURLs');

    editor.settings.relative_urls = false;
    editor.settings.remove_script_host = false;

    editor.setContent('<a href="test.html">test</a>');
    assert.equal(editor.getContent(), '<p><a href="http://www.site.com/dirA/dirB/dirC/test.html">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<a href="../test.html">test</a>');
    assert.equal(editor.getContent(), '<p><a href="http://www.site.com/dirA/dirB/test.html">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<a href="test/test.html">test</a>');
    assert.equal(editor.getContent(), '<p><a href="http://www.site.com/dirA/dirB/dirC/test/test.html">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<a href="http://www.somesite.com/test/file.htm">test</a>');
    assert.equal(editor.getContent(), '<p><a href="http://www.somesite.com/test/file.htm">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<a href="//www.site.com/test/file.htm">test</a>');
    assert.equal(editor.getContent(), '<p><a href="//www.site.com/test/file.htm">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<a href="//www.somesite.com/test/file.htm">test</a>');
    assert.equal(editor.getContent(), '<p><a href="//www.somesite.com/test/file.htm">test</a></p>', 'urls - absoluteURLs');
  });

  it('TBA: WebKit Serialization range bug', () => {
    if (Env.webkit) {
      const editor = hook.editor();
      // Note that if we create the P with this invalid content directly, Chrome cleans it up differently to other browsers so we don't
      // wind up testing the serialization functionality we were aiming for and the test fails.
      const p = editor.dom.create('p', {}, '123<table><tbody><tr><td>X</td></tr></tbody></table>456');
      editor.dom.replace(p, editor.getBody().firstChild);

      assert.equal(editor.getContent(), '<p>123</p><table><tbody><tr><td>X</td></tr></tbody></table><p>456</p>', 'WebKit Serialization range bug');
    }
  });

  it('TBA: editor_methods - getParam', () => {
    const editor = hook.editor();
    editor.settings.test = 'a,b,c';
    assert.equal(editor.getParam('test', '', 'hash').c, 'c', 'editor_methods - getParam');

    editor.settings.test = 'a';
    assert.equal(editor.getParam('test', '', 'hash').a, 'a', 'editor_methods - getParam');

    editor.settings.test = 'a=b';
    assert.equal(editor.getParam('test', '', 'hash').a, 'b', 'editor_methods - getParam');

    editor.settings.test = 'a=b;c=d,e';
    assert.equal(editor.getParam('test', '', 'hash').c, 'd,e', 'editor_methods - getParam');

    editor.settings.test = 'a=b,c=d';
    assert.equal(editor.getParam('test', '', 'hash').c, 'd', 'editor_methods - getParam');
  });

  it('TBA: setContent', () => {
    const editor = hook.editor();
    let count;

    const callback = (e) => {
      e.content = e.content.replace(/test/, 'X');
      count++;
    };

    editor.on('SetContent', callback);
    editor.on('BeforeSetContent', callback);
    count = 0;
    editor.setContent('<p>test</p>');
    assert.equal(editor.getContent(), '<p>X</p>', 'setContent');
    assert.equal(count, 2, 'setContent');
    editor.off('SetContent', callback);
    editor.off('BeforeSetContent', callback);

    count = 0;
    editor.setContent('<p>test</p>');
    assert.equal(editor.getContent(), '<p>test</p>', 'setContent');
    assert.equal(count, 0, 'setContent');
  });

  it('TBA: setContent with comment bug #4409', () => {
    const editor = hook.editor();
    editor.setContent('<!-- x --><br>');
    editor.settings.disable_nodechange = false;
    editor.nodeChanged();
    editor.settings.disable_nodechange = true;
    assert.equal(editor.getContent(), '<!-- x --><p>\u00a0</p>', 'setContent with comment bug #4409');
  });

  it('TBA: custom elements', () => {
    const editor = hook.editor();
    editor.setContent('<custom1>c1</custom1><custom2>c1</custom2>');
    assert.equal(editor.getContent(), '<custom1>c1</custom1><p><custom2>c1</custom2></p>', 'custom elements');
  });

  it('TBA: Store/restore tabindex', () => {
    const editor = hook.editor();
    editor.setContent('<span tabindex="42">abc</span>');
    assert.equal(editor.getContent({ format: 'raw' }).toLowerCase(), '<p><span data-mce-tabindex="42">abc</span></p>', 'Store/restore tabindex');
    assert.equal(editor.getContent(), '<p><span tabindex="42">abc</span></p>', 'Store/restore tabindex');
  });

  it('TBA: show/hide/isHidden and events', () => {
    const editor = hook.editor();
    let lastEvent;

    editor.on('show hide', (e) => {
      lastEvent = e;
    });

    assert.isFalse(editor.isHidden(), 'Initial isHidden state');

    editor.hide();
    assert.isTrue(editor.isHidden(), 'After hide isHidden state');
    assert.equal('hide', lastEvent.type, 'show/hide/isHidden and events');

    lastEvent = null;
    editor.hide();
    assert.isNull(lastEvent, 'show/hide/isHidden and events');

    editor.show();
    assert.isFalse(editor.isHidden(), 'After show isHidden state');
    assert.equal(lastEvent.type, 'show', 'show/hide/isHidden and events');

    lastEvent = null;
    editor.show();
    assert.isNull(lastEvent, 'show/hide/isHidden and events');
  });

  it('TBA: hide save content and hidden state while saving', () => {
    const editor = hook.editor();
    let lastEvent, hiddenStateWhileSaving;

    editor.on('SaveContent', (e) => {
      lastEvent = e;
      hiddenStateWhileSaving = editor.isHidden();
    });

    editor.setContent('xyz');
    editor.hide();

    const elm: any = document.getElementById(editor.id);
    assert.isFalse(hiddenStateWhileSaving, 'False isHidden state while saving');
    assert.equal(lastEvent.content, '<p>xyz</p>', 'hide save content and hidden state while saving');
    assert.equal(elm.value, '<p>xyz</p>', 'hide save content and hidden state while saving');

    editor.show();
  });

  it('TBA: insertContent', () => {
    const editor = hook.editor();
    editor.setContent('<p>ab</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.insertContent('c');
    assert.equal(editor.getContent(), '<p>acb</p>', 'insertContent');
  });

  it('TBA: insertContent merge', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>a</strong></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.insertContent('<em><strong>b</strong></em>', { merge: true });
    assert.equal(editor.getContent(), '<p><strong>a<em>b</em></strong></p>', 'insertContent merge');
  });

  it('TBA: addCommand', () => {
    const editor = hook.editor();
    const scope = {};
    let lastScope, lastArgs;

    const callback = function () { // Arrow function cannot be used with 'arguments'.
      // eslint-disable-next-line
      lastScope = this;
      lastArgs = arguments;
    };

    editor.addCommand('CustomCommand1', callback, scope);
    editor.addCommand('CustomCommand2', callback);

    editor.execCommand('CustomCommand1', false, 'value', { extra: true });
    assert.isFalse(lastArgs[0], 'addCommand');
    assert.equal( lastArgs[1], 'value', 'addCommand');
    assert.strictEqual(lastScope, scope, 'addCommand');

    editor.execCommand('CustomCommand2');
    assert.isUndefined(lastArgs[0], 'addCommand');
    assert.isUndefined(lastArgs[1], 'addCommand');
    assert.strictEqual(lastScope, editor, 'addCommand');
  });

  it('TBA: addQueryStateHandler', () => {
    const editor = hook.editor();
    const scope = {};
    let lastScope, currentState;

    const callback = function () { // Arrow function cannot be used with 'this'.
      // eslint-disable-next-line
      lastScope = this;
      return currentState;
    };

    editor.addQueryStateHandler('CustomCommand1', callback, scope);
    editor.addQueryStateHandler('CustomCommand2', callback);

    currentState = false;
    assert.equal(false, editor.queryCommandState('CustomCommand1'), 'addQueryStateHandler');
    assert.equal(true, lastScope === scope, 'Scope is not custom scope');

    currentState = true;
    assert.equal(true, editor.queryCommandState('CustomCommand2'), 'addQueryStateHandler');
    assert.equal(true, lastScope === editor, 'Scope is not editor');
  });

  it('TBA: Block script execution', () => {
    const editor = hook.editor();
    editor.setContent('<script></script><script type="x"></script><script type="mce-x"></script><p>x</p>');
    assert.equal(
      HtmlUtils.cleanHtml(editor.getBody().innerHTML),
      '<script type="mce-no/type"></script>' +
      '<script type="mce-x"></script>' +
      '<script type="mce-x"></script>' +
      '<p>x</p>',
      'Block script execution'
    );
    assert.equal(
      editor.getContent(),
      '<script></script>' +
      '<script type="x"></script>' +
      '<script type="x"></script>' +
      '<p>x</p>',
      'Block script execution'
    );
  });

  it('TBA: addQueryValueHandler', () => {
    const editor = hook.editor();
    const scope = {};
    let lastScope, currentValue;

    const callback = function () { // Arrow function cannot be used with 'this'.
      // eslint-disable-next-line
      lastScope = this;
      return currentValue;
    };

    editor.addQueryValueHandler('CustomCommand1', callback, scope);
    editor.addQueryValueHandler('CustomCommand2', callback);

    currentValue = 'a';
    assert.equal(editor.queryCommandValue('CustomCommand1'), 'a', 'addQueryValueHandler');
    assert.strictEqual(lastScope, scope, 'Scope is not custom scope');

    currentValue = 'b';
    assert.equal(editor.queryCommandValue('CustomCommand2'), 'b', 'addQueryValueHandler');
    assert.strictEqual(lastScope, editor, 'Scope is not editor');
  });

  it('TBA: setDirty/isDirty', () => {
    const editor = hook.editor();
    let lastArgs = null;

    editor.on('dirty', (e) => {
      lastArgs = e;
    });

    editor.setDirty(false);
    assert.isNull(lastArgs, 'setDirty/isDirty');
    assert.isFalse(editor.isDirty(), 'setDirty/isDirty');

    editor.setDirty(true);
    assert.equal(lastArgs.type, 'dirty', 'setDirty/isDirty');
    assert.isTrue( editor.isDirty(), 'setDirty/isDirty');

    lastArgs = null;
    editor.setDirty(true);
    assert.isNull(lastArgs, 'setDirty/isDirty');
    assert.isTrue(editor.isDirty(), 'setDirty/isDirty');

    editor.setDirty(false);
    assert.isNull(lastArgs, 'setDirty/isDirty');
    assert.isFalse(editor.isDirty(), 'setDirty/isDirty');
  });

  it('TBA: setMode', () => {
    const editor = hook.editor();
    let clickCount = 0;

    const isDisabled = (selector) => {
      const elm = UiFinder.findIn(SugarBody.body(), selector);
      return elm.forall((elm) => Attribute.has(elm, 'disabled') || Class.has(elm, 'tox-tbtn--disabled'));
    };

    editor.on('click', () => {
      clickCount++;
    });

    editor.dom.fire(editor.getBody(), 'click');
    assert.equal(clickCount, 1, 'setMode');

    editor.setMode('readonly');
    assert.isTrue(isDisabled('.tox-editor-container button:last'), 'setMode');
    editor.dom.fire(editor.getBody(), 'click');
    assert.equal(clickCount, 1, 'setMode');

    editor.setMode('design');
    editor.dom.fire(editor.getBody(), 'click');
    assert.isFalse(isDisabled('.tox-editor-container button:last'), 'setMode');
    assert.equal(clickCount, 2, 'setMode');
  });

  it('TBA: translate', () => {
    const editor = hook.editor();
    EditorManager.addI18n('en', {
      'input i18n': 'output i18n',
      'value:{0}{1}': 'value translation:{0}{1}'
    });

    assert.equal(editor.translate('input i18n'), 'output i18n', 'translate');
    assert.equal(editor.translate([ 'value:{0}{1}', 'a', 'b' ]), 'value translation:ab', 'translate');
  });

  it('TBA: Treat some paragraphs as empty contents', () => {
    const editor = hook.editor();
    editor.setContent('<p><br /></p>');
    assert.equal(editor.getContent(), '', 'Treat some paragraphs as empty contents');

    editor.setContent('<p>\u00a0</p>');
    assert.equal(editor.getContent(), '', 'Treat some paragraphs as empty contents');
  });

  it('TBA: kamer word boundaries', () => {
    const editor = hook.editor();
    editor.setContent('<p>!\u200b!\u200b!</p>');
    assert.equal(editor.getContent(), '<p>!\u200b!\u200b!</p>', 'kamer word boundaries');
  });

  it('TBA: Preserve whitespace pre elements', () => {
    const editor = hook.editor();
    editor.setContent('<pre> </pre>');
    assert.equal(editor.getContent(), '<pre> </pre>', 'kamer word boundaries');
  });

  it('TBA: hasFocus', () => {
    const editor = hook.editor();
    editor.focus();
    assert.isTrue(editor.hasFocus(), 'hasFocus');

    const input = document.createElement('input');
    document.body.appendChild(input);

    input.focus();
    assert.isFalse(editor.hasFocus(), 'hasFocus');

    editor.focus();
    assert.isTrue(editor.hasFocus(), 'hasFocus');

    input.parentNode.removeChild(input);
  });

  context('hasPlugin', () => {
    const checkWithoutManager = (title: string, plugins: string, plugin: string, expected: boolean) => {
      const editor = hook.editor();
      editor.settings.plugins = plugins;
      assert.equal(editor.hasPlugin(plugin), expected, title);
    };

    const checkWithManager = (title: string, plugins: string, plugin: string, addToManager: boolean, expected: boolean) => {
      const editor = hook.editor();
      if (addToManager) {
        PluginManager.add('ParticularPlugin', Fun.noop);
      }

      editor.settings.plugins = plugins;
      assert.equal(editor.hasPlugin(plugin, true), expected, title);

      if (addToManager) {
        PluginManager.remove('ParticularPlugin');
      }
    };

    it('TINY-766: Checking without requiring a plugin to be loaded', () => {
      checkWithoutManager('Plugin does not exist', 'Plugin Is Not Here', 'ParticularPlugin', false);
      checkWithoutManager('Plugin does exist with spaces', 'Has ParticularPlugin In List', 'ParticularPlugin', true);
      checkWithoutManager('Plugin does exist with commas', 'Has,ParticularPlugin,In,List', 'ParticularPlugin', true);
      checkWithoutManager('Plugin does exist with spaces and commas', 'Has, ParticularPlugin, In, List', 'ParticularPlugin', true);
      checkWithoutManager('Plugin does not patch to OtherPlugin', 'Has OtherPlugin In List', 'Plugin', false);
    });

    it('TINY-766: Checking while requiring a plugin to be loaded', () => {
      checkWithManager('Plugin does not exist', 'Plugin Is Not Here', 'ParticularPlugin', true, false);
      checkWithManager('Plugin does exist with spaces', 'Has ParticularPlugin In List', 'ParticularPlugin', true, true);
      checkWithManager('Plugin does exist with commas', 'Has,ParticularPlugin,In,List', 'ParticularPlugin', true, true);
      checkWithManager('Plugin does exist with spaces and commas', 'Has, ParticularPlugin, In, List', 'ParticularPlugin', true, true);
      checkWithManager('Plugin does not patch to OtherPlugin', 'Has OtherPlugin In List', 'Plugin', true, false);
      checkWithManager('Plugin which has not loaded does not return true', 'Has ParticularPlugin In List', 'ParticularPlugin', false, false);
    });
  });
});
