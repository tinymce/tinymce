import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attribute, Class, SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import { BeforeSetContentEvent, SaveContentEvent, SetContentEvent } from 'tinymce/core/api/EventTypes';
import PluginManager from 'tinymce/core/api/PluginManager';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import URI from 'tinymce/core/api/util/URI';
import { UndoLevel } from 'tinymce/core/undo/UndoManagerTypes';

import * as HtmlUtils from '../module/test/HtmlUtils';

describe('browser.tinymce.core.EditorTest', () => {
  const browser = PlatformDetection.detect().browser;
  const hook = TinyHooks.bddSetup<Editor>({
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    custom_elements: 'custom1,~custom2',
    extended_valid_elements: 'custom1,custom2,script[*]',
    entities: 'raw',
    indent: false,
    custom_prop1: 5,
    custom_prop2: 5,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('TBA: Event: change', () => {
    const editor = hook.editor();
    let level: UndoLevel | undefined;
    let lastLevel: UndoLevel | undefined;

    editor.on('change', (e) => {
      level = e.level;
      lastLevel = e.lastLevel;
    });

    editor.setContent('');
    editor.insertContent('a');
    assert.equal(level?.content.toLowerCase(), '<p>a</p>', 'Event: change');
    assert.equal(lastLevel?.content, editor.undoManager.data[0].content, 'Event: change');

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
    editor.options.set('relative_urls', true);
    editor.documentBaseURI = new URI('http://www.site.com/dirA/dirB/dirC/');

    editor.setContent('<p><a href="test.html">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="test.html">test</a></p>', 'urls - relativeURLs');

    editor.setContent('<p><a href="../test.html">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="../test.html">test</a></p>', 'urls - relativeURLs');

    editor.setContent('<p><a href="test/test.html">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="test/test.html">test</a></p>', 'urls - relativeURLs');

    editor.setContent('<p><a href="/test.html">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="../../../test.html">test</a></p>', 'urls - relativeURLs');

    editor.setContent('<p><a href="http://www.somesite.com/test/file.htm">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="http://www.somesite.com/test/file.htm">test</a></p>', 'urls - relativeURLs');

    editor.setContent('<p><a href="//www.site.com/test/file.htm">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="../../../test/file.htm">test</a></p>', 'urls - relativeURLs');

    editor.setContent('<p><a href="//www.somesite.com/test/file.htm">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="//www.somesite.com/test/file.htm">test</a></p>', 'urls - relativeURLs');

    const nonHttpLink = 'onenote:///D:\Anote\New%20Section%201.one';

    editor.setContent(`<p><a href="${nonHttpLink}">test</a></p>`);
    assert.equal(editor.getContent(), `<p><a href="${nonHttpLink}">test</a></p>`, 'urls - relativeURLs: TINY-10153');
  });

  it('TBA: urls - absoluteURLs', () => {
    const editor = hook.editor();
    editor.options.set('relative_urls', false);
    editor.options.set('remove_script_host', true);
    editor.documentBaseURI = new URI('http://www.site.com/dirA/dirB/dirC/');

    editor.setContent('<p><a href="test.html">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="/dirA/dirB/dirC/test.html">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<p><a href="../test.html">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="/dirA/dirB/test.html">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<p><a href="test/test.html">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="/dirA/dirB/dirC/test/test.html">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<p><a href="http://www.somesite.com/test/file.htm">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="http://www.somesite.com/test/file.htm">test</a></p>', 'urls - absoluteURLs');

    const nonHttpLink = 'onenote:///D:\Anote\New%20Section%201.one';

    editor.setContent(`<p><a href="${nonHttpLink}">test</a></p>`);
    assert.equal(editor.getContent(), `<p><a href="${nonHttpLink}">test</a></p>`, 'urls - absoluteURLs: TINY-10153');

    editor.options.set('relative_urls', false);
    editor.options.set('remove_script_host', false);

    editor.setContent('<p><a href="test.html">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="http://www.site.com/dirA/dirB/dirC/test.html">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<p><a href="../test.html">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="http://www.site.com/dirA/dirB/test.html">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<p><a href="test/test.html">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="http://www.site.com/dirA/dirB/dirC/test/test.html">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<p><a href="http://www.somesite.com/test/file.htm">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="http://www.somesite.com/test/file.htm">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<p><a href="//www.site.com/test/file.htm">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="//www.site.com/test/file.htm">test</a></p>', 'urls - absoluteURLs');

    editor.setContent('<p><a href="//www.somesite.com/test/file.htm">test</a></p>');
    assert.equal(editor.getContent(), '<p><a href="//www.somesite.com/test/file.htm">test</a></p>', 'urls - absoluteURLs');

    editor.setContent(`<p><a href="${nonHttpLink}">test</a></p>`);
    assert.equal(editor.getContent(), `<p><a href="${nonHttpLink}">test</a></p>`, 'urls - absoluteURLs: TINY-10153');
  });

  it('TBA: WebKit Serialization range bug', function () {
    if (!(browser.isChromium() || browser.isSafari())) {
      this.skip();
    }

    const editor = hook.editor();
    // Note that if we create the P with this invalid content directly, Chrome cleans it up differently to other browsers so we don't
    // wind up testing the serialization functionality we were aiming for and the test fails.
    const p = editor.dom.create('p', {}, '123<table><tbody><tr><td>X</td></tr></tbody></table>456');
    editor.dom.replace(p, editor.getBody().firstChild);

    assert.equal(editor.getContent(), '<p>123</p><table><tbody><tr><td>X</td></tr></tbody></table><p>456</p>', 'WebKit Serialization range bug');
  });

  it('TBA: editor_methods - getParam', () => {
    const editor = hook.editor();

    assert.isUndefined(editor.getParam('test1'), 'unregistered with no default');
    assert.equal(editor.getParam('test2', ''), '', 'unregistered with default');
    assert.equal(editor.getParam('test2', 'blah'), 'blah', 'unregistered with different default');

    assert.equal(editor.getParam('custom_prop1', 10, 'number'), 5, 'unregistered with correct type');
    assert.equal(editor.getParam('custom_prop2', '10', 'string'), '10', 'unregistered with incorrect type');

    editor.options.register('test4', { processor: 'string', default: 'default' });
    assert.equal(editor.getParam('test4'), 'default', 'registered with no passed default');
    assert.equal(editor.getParam('test4', 'override'), 'override', 'registered with passed default');
  });

  it('TBA: setContent', () => {
    const editor = hook.editor();
    let count: number;

    const callback = (e: EditorEvent<SetContentEvent | BeforeSetContentEvent>) => {
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
    editor.options.set('disable_nodechange', false);
    editor.nodeChanged();
    editor.options.set('disable_nodechange', true);
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
    let lastEvent: EditorEvent<{}> | undefined;

    editor.on('show hide', (e) => {
      lastEvent = e;
    });

    assert.isFalse(editor.isHidden(), 'Initial isHidden state');

    editor.hide();
    assert.isTrue(editor.isHidden(), 'After hide isHidden state');
    assert.equal(lastEvent?.type, 'hide', 'show/hide/isHidden and events');

    lastEvent = undefined;
    editor.hide();
    assert.isUndefined(lastEvent, 'show/hide/isHidden and events');

    editor.show();
    assert.isFalse(editor.isHidden(), 'After show isHidden state');
    assert.equal((lastEvent as unknown as EditorEvent<{}>).type, 'show', 'show/hide/isHidden and events');

    lastEvent = undefined;
    editor.show();
    assert.isUndefined(lastEvent, 'show/hide/isHidden and events');
  });

  it('TBA: hide save content and hidden state while saving', () => {
    const editor = hook.editor();
    let lastEvent: EditorEvent<SaveContentEvent> | undefined;
    let hiddenStateWhileSaving: boolean | undefined;

    editor.on('SaveContent', (e) => {
      lastEvent = e;
      hiddenStateWhileSaving = editor.isHidden();
    });

    editor.setContent('xyz');
    editor.hide();

    const elm: any = document.getElementById(editor.id);
    assert.isFalse(hiddenStateWhileSaving, 'False isHidden state while saving');
    assert.equal(lastEvent?.content, '<p>xyz</p>', 'hide save content and hidden state while saving');
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
    let lastScope: {} | undefined;
    let lastArgs: IArguments | undefined;

    const callback = function (this: {}) { // Arrow function cannot be used with 'arguments'.
      // eslint-disable-next-line
      lastScope = this;
      lastArgs = arguments;
    };

    editor.addCommand('CustomCommand1', callback, scope);
    editor.addCommand('CustomCommand2', callback);

    editor.execCommand('CustomCommand1', false, 'value');
    assert.isFalse(lastArgs?.[0], 'ui');
    assert.equal(lastArgs?.[1], 'value', 'value');
    assert.strictEqual(lastScope, scope, 'scope');

    editor.execCommand('CustomCommand2');
    assert.isFalse(lastArgs?.[0], 'ui');
    assert.isUndefined(lastArgs?.[1], 'value');
    assert.strictEqual(lastScope, editor, 'scope');
  });

  it('TBA: addQueryStateHandler', () => {
    const editor = hook.editor();
    const scope = {};
    let lastScope: {} | undefined;
    let currentState: boolean;

    const callback = function (this: {}) { // Arrow function cannot be used with 'this'.
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
    let lastScope: {} | undefined;
    let currentValue: string;

    const callback = function (this: {}) { // Arrow function cannot be used with 'this'.
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
    let lastArgs: EditorEvent<{}> | undefined;

    editor.on('dirty', (e) => {
      lastArgs = e;
    });

    editor.setDirty(false);
    assert.isUndefined(lastArgs, 'setDirty/isDirty');
    assert.isFalse(editor.isDirty(), 'setDirty/isDirty');

    editor.setDirty(true);
    assert.equal(lastArgs?.type, 'dirty', 'setDirty/isDirty');
    assert.isTrue( editor.isDirty(), 'setDirty/isDirty');

    lastArgs = undefined;
    editor.setDirty(true);
    assert.isUndefined(lastArgs, 'setDirty/isDirty');
    assert.isTrue(editor.isDirty(), 'setDirty/isDirty');

    editor.setDirty(false);
    assert.isUndefined(lastArgs, 'setDirty/isDirty');
    assert.isFalse(editor.isDirty(), 'setDirty/isDirty');
  });

  it('TBA: setMode', () => {
    const editor = hook.editor();
    let clickCount = 0;

    const isDisabled = (selector: string) => {
      const elm = UiFinder.findIn(SugarBody.body(), selector);
      return elm.forall((elm) => Attribute.has(elm, 'disabled') || Class.has(elm, 'tox-tbtn--disabled'));
    };

    editor.on('click', () => {
      clickCount++;
    });

    editor.dom.dispatch(editor.getBody(), 'click');
    assert.equal(clickCount, 1, 'setMode');

    editor.mode.set('readonly');
    assert.isTrue(isDisabled('.tox-editor-container button:last-of-type'), 'setMode');
    editor.dom.dispatch(editor.getBody(), 'click');
    assert.equal(clickCount, 1, 'setMode');

    editor.mode.set('design');
    editor.dom.dispatch(editor.getBody(), 'click');
    assert.isFalse(isDisabled('.tox-editor-container button:last-of-type'), 'setMode');
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

    input.parentNode?.removeChild(input);
  });

  it('TINY-6946: Images should be properly cleaned up if they contain invalid trailing data', () => {
    const editor = hook.editor();
    editor.setContent('<img src="data:image/gif;base64,R0lGODdhIAAgAIABAP8AAP///ywAAAAAIAAgAAACHoSPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gubBQA7AA==%A0">');
    TinyAssertions.assertContent(editor, '<p><img src="data:image/gif;base64,R0lGODdhIAAgAIABAP8AAP///ywAAAAAIAAgAAACHoSPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gubBQA7AA=="></p>');
  });

  it('TINY-6946: Images should cut off invalid data, even if the image remains invalid', () => {
    const editor = hook.editor();
    editor.setContent('<img src="data:image/gif;base64,R0ÖlGODdhIAAgAIABAP8AAP///ywAAAAAIAAgAAACHoSPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gubBQA7AA==%A0">');
    TinyAssertions.assertContent(editor, '<p><img src="data:image/gif;base64,R0"></p>');
  });

  context('hasPlugin', () => {
    const checkWithoutManager = (title: string, plugins: string, plugin: string, expected: boolean) => {
      const editor = hook.editor();
      editor.options.set('plugins', plugins.split(/[ ,]/));
      assert.equal(editor.hasPlugin(plugin), expected, title);
    };

    const checkWithManager = (title: string, plugins: string, plugin: string, addToManager: boolean, expected: boolean) => {
      const editor = hook.editor();
      if (addToManager) {
        PluginManager.add('ParticularPlugin', Fun.noop);
      }

      editor.options.set('plugins', plugins.split(/[ ,]/));
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
