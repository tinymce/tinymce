import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import EditorManager from 'tinymce/core/api/EditorManager';
import Env from 'tinymce/core/api/Env';
import HtmlUtils from '../module/test/HtmlUtils';
import URI from 'tinymce/core/api/util/URI';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.EditorTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  suite.test('Event: change', function (editor) {
    let level, lastLevel;

    editor.on('change', function (e) {
      level = e.level;
      lastLevel = e.lastLevel;
    });

    editor.setContent('');
    editor.insertContent('a');
    LegacyUnit.equal(level.content.toLowerCase(), '<p>a</p>');
    LegacyUnit.equal(lastLevel.content, editor.undoManager.data[0].content);

    editor.off('change');
  });

  suite.test('Event: beforeExecCommand', function (editor) {
    let cmd, ui, value;

    editor.on('BeforeExecCommand', function (e) {
      cmd = e.command;
      ui = e.ui;
      value = e.value;

      e.preventDefault();
    });

    editor.setContent('');
    editor.insertContent('a');
    LegacyUnit.equal(editor.getContent(), '');
    LegacyUnit.equal(cmd, 'mceInsertContent');
    LegacyUnit.equal(ui, false);
    LegacyUnit.equal(value, 'a');

    editor.off('BeforeExecCommand');
    editor.setContent('');
    editor.insertContent('a');
    LegacyUnit.equal(editor.getContent(), '<p>a</p>');
  });

  suite.test('urls - relativeURLs', function (editor) {
    editor.settings.relative_urls = true;
    editor.documentBaseURI = new URI('http://www.site.com/dirA/dirB/dirC/');

    editor.setContent('<a href="test.html">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="test.html">test</a></p>');

    editor.setContent('<a href="../test.html">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="../test.html">test</a></p>');

    editor.setContent('<a href="test/test.html">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="test/test.html">test</a></p>');

    editor.setContent('<a href="/test.html">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="../../../test.html">test</a></p>');

    editor.setContent('<a href="http://www.somesite.com/test/file.htm">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="http://www.somesite.com/test/file.htm">test</a></p>');

    editor.setContent('<a href="//www.site.com/test/file.htm">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="../../../test/file.htm">test</a></p>');

    editor.setContent('<a href="//www.somesite.com/test/file.htm">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="//www.somesite.com/test/file.htm">test</a></p>');
  });

  suite.test('urls - absoluteURLs', function (editor) {
    editor.settings.relative_urls = false;
    editor.settings.remove_script_host = true;
    editor.documentBaseURI = new URI('http://www.site.com/dirA/dirB/dirC/');

    editor.setContent('<a href="test.html">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="/dirA/dirB/dirC/test.html">test</a></p>');

    editor.setContent('<a href="../test.html">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="/dirA/dirB/test.html">test</a></p>');

    editor.setContent('<a href="test/test.html">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="/dirA/dirB/dirC/test/test.html">test</a></p>');

    editor.setContent('<a href="http://www.somesite.com/test/file.htm">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="http://www.somesite.com/test/file.htm">test</a></p>');

    editor.settings.relative_urls = false;
    editor.settings.remove_script_host = false;

    editor.setContent('<a href="test.html">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="http://www.site.com/dirA/dirB/dirC/test.html">test</a></p>');

    editor.setContent('<a href="../test.html">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="http://www.site.com/dirA/dirB/test.html">test</a></p>');

    editor.setContent('<a href="test/test.html">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="http://www.site.com/dirA/dirB/dirC/test/test.html">test</a></p>');

    editor.setContent('<a href="http://www.somesite.com/test/file.htm">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="http://www.somesite.com/test/file.htm">test</a></p>');

    editor.setContent('<a href="//www.site.com/test/file.htm">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="//www.site.com/test/file.htm">test</a></p>');

    editor.setContent('<a href="//www.somesite.com/test/file.htm">test</a>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="//www.somesite.com/test/file.htm">test</a></p>');
  });

  suite.test('WebKit Serialization range bug', function (editor) {
    if (Env.webkit) {
      // Note that if we create the P with this invalid content directly, Chrome cleans it up differently to other browsers so we don't
      // wind up testing the serialization functionality we were aiming for and the test fails.
      const p = editor.dom.create('p', {}, '123<table><tbody><tr><td>X</td></tr></tbody></table>456');
      editor.dom.replace(p, editor.getBody().firstChild);

      LegacyUnit.equal(editor.getContent(), '<p>123</p><table><tbody><tr><td>X</td></tr></tbody></table><p>456</p>');
    }
  });

  suite.test('editor_methods - getParam', function (editor) {
    editor.settings.test = 'a,b,c';
    LegacyUnit.equal(editor.getParam('test', '', 'hash').c, 'c');

    editor.settings.test = 'a';
    LegacyUnit.equal(editor.getParam('test', '', 'hash').a, 'a');

    editor.settings.test = 'a=b';
    LegacyUnit.equal(editor.getParam('test', '', 'hash').a, 'b');

    editor.settings.test = 'a=b;c=d,e';
    LegacyUnit.equal(editor.getParam('test', '', 'hash').c, 'd,e');

    editor.settings.test = 'a=b,c=d';
    LegacyUnit.equal(editor.getParam('test', '', 'hash').c, 'd');
  });

  suite.test('setContent', function (editor) {
    let count;

    const callback = function (e) {
      e.content = e.content.replace(/test/, 'X');
      count++;
    };

    editor.on('SetContent', callback);
    editor.on('BeforeSetContent', callback);
    count = 0;
    editor.setContent('<p>test</p>');
    LegacyUnit.equal(editor.getContent(), '<p>X</p>');
    LegacyUnit.equal(count, 2);
    editor.off('SetContent', callback);
    editor.off('BeforeSetContent', callback);

    count = 0;
    editor.setContent('<p>test</p>');
    LegacyUnit.equal(editor.getContent(), '<p>test</p>');
    LegacyUnit.equal(count, 0);
  });

  suite.test('setContent with comment bug #4409', function (editor) {
    editor.setContent('<!-- x --><br>');
    editor.settings.disable_nodechange = false;
    editor.nodeChanged();
    editor.settings.disable_nodechange = true;
    LegacyUnit.equal(editor.getContent(), '<!-- x --><p>\u00a0</p>');
  });

  suite.test('custom elements', function (editor) {
    editor.setContent('<custom1>c1</custom1><custom2>c1</custom2>');
    LegacyUnit.equal(editor.getContent(), '<custom1>c1</custom1><p><custom2>c1</custom2></p>');
  });

  suite.test('Store/restore tabindex', function (editor) {
    editor.setContent('<span tabindex="42">abc</span>');
    LegacyUnit.equal(editor.getContent({ format: 'raw' }).toLowerCase(), '<p><span data-mce-tabindex="42">abc</span></p>');
    LegacyUnit.equal(editor.getContent(), '<p><span tabindex="42">abc</span></p>');
  });

  suite.test('show/hide/isHidden and events', function (editor) {
    let lastEvent;

    editor.on('show hide', function (e) {
      lastEvent = e;
    });

    LegacyUnit.equal(editor.isHidden(), false, 'Initial isHidden state');

    editor.hide();
    LegacyUnit.equal(editor.isHidden(), true, 'After hide isHidden state');
    LegacyUnit.equal(lastEvent.type, 'hide');

    lastEvent = null;
    editor.hide();
    LegacyUnit.equal(lastEvent, null);

    editor.show();
    LegacyUnit.equal(editor.isHidden(), false, 'After show isHidden state');
    LegacyUnit.equal(lastEvent.type, 'show');

    lastEvent = null;
    editor.show();
    LegacyUnit.equal(lastEvent, null);
  });

  suite.test('hide save content and hidden state while saving', function (editor) {
    let lastEvent, hiddenStateWhileSaving;

    editor.on('SaveContent', function (e) {
      lastEvent = e;
      hiddenStateWhileSaving = editor.isHidden();
    });

    editor.setContent('xyz');
    editor.hide();

    const elm: any = document.getElementById(editor.id);
    LegacyUnit.equal(hiddenStateWhileSaving, false, 'False isHidden state while saving');
    LegacyUnit.equal(lastEvent.content, '<p>xyz</p>');
    LegacyUnit.equal(elm.value, '<p>xyz</p>');

    editor.show();
  });

  suite.test('insertContent', function (editor) {
    editor.setContent('<p>ab</p>');
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.insertContent('c');
    LegacyUnit.equal(editor.getContent(), '<p>acb</p>');
  });

  suite.test('insertContent merge', function (editor) {
    editor.setContent('<p><strong>a</strong></p>');
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.insertContent('<em><strong>b</strong></em>', { merge: true });
    LegacyUnit.equal(editor.getContent(), '<p><strong>a<em>b</em></strong></p>');
  });

  suite.test('addCommand', function (editor) {
    const scope = {};
    let lastScope, lastArgs;

    const callback = function () {
      // eslint-disable-next-line
      lastScope = this;
      lastArgs = arguments;
    };

    editor.addCommand('CustomCommand1', callback, scope);
    editor.addCommand('CustomCommand2', callback);

    editor.execCommand('CustomCommand1', false, 'value', { extra: true });
    LegacyUnit.equal(lastArgs[0], false);
    LegacyUnit.equal(lastArgs[1], 'value');
    LegacyUnit.equal(lastScope === scope, true);

    editor.execCommand('CustomCommand2');
    LegacyUnit.equal(typeof lastArgs[0], 'undefined');
    LegacyUnit.equal(typeof lastArgs[1], 'undefined');
    LegacyUnit.equal(lastScope === editor, true);
  });

  suite.test('addQueryStateHandler', function (editor) {
    const scope = {};
    let lastScope, currentState;

    const callback = function () {
      // eslint-disable-next-line
      lastScope = this;
      return currentState;
    };

    editor.addQueryStateHandler('CustomCommand1', callback, scope);
    editor.addQueryStateHandler('CustomCommand2', callback);

    currentState = false;
    LegacyUnit.equal(editor.queryCommandState('CustomCommand1'), false);
    LegacyUnit.equal(lastScope === scope, true, 'Scope is not custom scope');

    currentState = true;
    LegacyUnit.equal(editor.queryCommandState('CustomCommand2'), true);
    LegacyUnit.equal(lastScope === editor, true, 'Scope is not editor');
  });

  suite.test('Block script execution', function (editor) {
    editor.setContent('<script></script><script type="x"></script><script type="mce-x"></script><p>x</p>');
    LegacyUnit.equal(
      HtmlUtils.cleanHtml(editor.getBody().innerHTML),
      '<script type="mce-no/type"></script>' +
      '<script type="mce-x"></script>' +
      '<script type="mce-x"></script>' +
      '<p>x</p>'
    );
    LegacyUnit.equal(
      editor.getContent(),
      '<script></script>' +
      '<script type="x"></script>' +
      '<script type="x"></script>' +
      '<p>x</p>'
    );
  });

  suite.test('addQueryValueHandler', function (editor) {
    const scope = {};
    let lastScope, currentValue;

    const callback = function () {
      // eslint-disable-next-line
      lastScope = this;
      return currentValue;
    };

    editor.addQueryValueHandler('CustomCommand1', callback, scope);
    editor.addQueryValueHandler('CustomCommand2', callback);

    currentValue = 'a';
    LegacyUnit.equal(editor.queryCommandValue('CustomCommand1'), 'a');
    LegacyUnit.equal(lastScope === scope, true, 'Scope is not custom scope');

    currentValue = 'b';
    LegacyUnit.equal(editor.queryCommandValue('CustomCommand2'), 'b');
    LegacyUnit.equal(lastScope === editor, true, 'Scope is not editor');
  });

  suite.test('setDirty/isDirty', function (editor) {
    let lastArgs = null;

    editor.on('dirty', function (e) {
      lastArgs = e;
    });

    editor.setDirty(false);
    LegacyUnit.equal(lastArgs, null);
    LegacyUnit.equal(editor.isDirty(), false);

    editor.setDirty(true);
    LegacyUnit.equal(lastArgs.type, 'dirty');
    LegacyUnit.equal(editor.isDirty(), true);

    lastArgs = null;
    editor.setDirty(true);
    LegacyUnit.equal(lastArgs, null);
    LegacyUnit.equal(editor.isDirty(), true);

    editor.setDirty(false);
    LegacyUnit.equal(lastArgs, null);
    LegacyUnit.equal(editor.isDirty(), false);
  });

  suite.test('setMode', function (editor) {
    let clickCount = 0;

    editor.on('click', function () {
      clickCount++;
    });

    editor.dom.fire(editor.getBody(), 'click');
    LegacyUnit.equal(clickCount, 1);

    editor.setMode('readonly');
    LegacyUnit.equal(editor.theme.panel.find('button:last')[2].disabled(), true);
    editor.dom.fire(editor.getBody(), 'click');
    LegacyUnit.equal(clickCount, 1);

    editor.setMode('design');
    editor.dom.fire(editor.getBody(), 'click');
    LegacyUnit.equal(editor.theme.panel.find('button:last')[2].disabled(), false);
    LegacyUnit.equal(clickCount, 2);
  });

  suite.test('translate', function (editor) {
    EditorManager.addI18n('en_US', {
      'input i18n': 'output i18n',
      'value:{0}{1}': 'value translation:{0}{1}'
    });

    LegacyUnit.equal(editor.translate('input i18n'), 'output i18n');
    LegacyUnit.equal(editor.translate(['value:{0}{1}', 'a', 'b']), 'value translation:ab');
  });

  suite.test('Treat some paragraphs as empty contents', function (editor) {
    editor.setContent('<p><br /></p>');
    LegacyUnit.equal(editor.getContent(), '');

    editor.setContent('<p>\u00a0</p>');
    LegacyUnit.equal(editor.getContent(), '');
  });

  suite.test('kamer word boundaries', function (editor) {
    editor.setContent('<p>!\u200b!\u200b!</p>');
    LegacyUnit.equal(editor.getContent(), '<p>!\u200b!\u200b!</p>');
  });

  suite.test('Padd empty elements with br', function (editor) {
    editor.settings.padd_empty_with_br = true;
    editor.setContent('<p>a</p><p></p>');
    LegacyUnit.equal(editor.getContent(), '<p>a</p><p><br /></p>');
    delete editor.settings.padd_empty_with_br;
  });

  suite.test('Padd empty elements with br on insert at caret', function (editor) {
    editor.settings.padd_empty_with_br = true;
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.insertContent('<p>b</p><p></p>');
    LegacyUnit.equal(editor.getContent(), '<p>a</p><p>b</p><p><br /></p>');
    delete editor.settings.padd_empty_with_br;
  });

  suite.test('Preserve whitespace pre elements', function (editor) {
    editor.setContent('<pre> </pre>');
    LegacyUnit.equal(editor.getContent(), '<pre> </pre>');
  });

  suite.test('hasFocus', function (editor) {
    editor.focus();
    LegacyUnit.equal(editor.hasFocus(), true);

    const input = document.createElement('input');
    document.body.appendChild(input);

    input.focus();
    LegacyUnit.equal(editor.hasFocus(), false);

    editor.focus();
    LegacyUnit.equal(editor.hasFocus(), true);

    input.parentNode.removeChild(input);
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), function () {
      onSuccess();
    }, onFailure);
  }, {
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    custom_elements: 'custom1,~custom2',
    extended_valid_elements: 'custom1,custom2,script[*]',
    entities: 'raw',
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
