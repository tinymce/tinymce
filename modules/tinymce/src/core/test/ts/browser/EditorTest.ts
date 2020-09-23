import { Log, Pipeline, Step, UiFinder } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Attribute, Class, SugarBody } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import Env from 'tinymce/core/api/Env';
import PluginManager from 'tinymce/core/api/PluginManager';
import URI from 'tinymce/core/api/util/URI';
import Theme from 'tinymce/themes/silver/Theme';
import * as HtmlUtils from '../module/test/HtmlUtils';

UnitTest.asynctest('browser.tinymce.core.EditorTest', (success, failure) => {
  Theme();

  const sEventChange = (editor: Editor) => Log.step('TBA', 'Event: change', Step.sync(() => {
    let level, lastLevel;

    editor.on('change', (e) => {
      level = e.level;
      lastLevel = e.lastLevel;
    });

    editor.setContent('');
    editor.insertContent('a');
    Assert.eq('Event: change', '<p>a</p>', level.content.toLowerCase());
    Assert.eq('Event: change', editor.undoManager.data[0].content, lastLevel.content);

    editor.off('change');
  }));

  const sEventBeforeExecCommand = (editor: Editor) => Log.step('TBA', 'Event: beforeExecCommand', Step.sync(() => {
    let cmd, ui, value;

    editor.on('BeforeExecCommand', (e) => {
      cmd = e.command;
      ui = e.ui;
      value = e.value;

      e.preventDefault();
    });

    editor.setContent('');
    editor.insertContent('a');
    Assert.eq('BeforeExecCommand', '', editor.getContent());
    Assert.eq('BeforeExecCommand', 'mceInsertContent', cmd);
    Assert.eq('BeforeExecCommand', false, ui);
    Assert.eq('BeforeExecCommand', 'a', value);

    editor.off('BeforeExecCommand');
    editor.setContent('');
    editor.insertContent('a');
    Assert.eq('BeforeExecCommand', '<p>a</p>', editor.getContent());
  }));

  const sRelativeUrls = (editor: Editor) => Log.step('TBA', 'urls - relativeURLs', Step.sync(() => {
    editor.settings.relative_urls = true;
    editor.documentBaseURI = new URI('http://www.site.com/dirA/dirB/dirC/');

    editor.setContent('<a href="test.html">test</a>');
    Assert.eq('urls - relativeURLs', '<p><a href="test.html">test</a></p>', editor.getContent());

    editor.setContent('<a href="../test.html">test</a>');
    Assert.eq('urls - relativeURLs', '<p><a href="../test.html">test</a></p>', editor.getContent());

    editor.setContent('<a href="test/test.html">test</a>');
    Assert.eq('urls - relativeURLs', '<p><a href="test/test.html">test</a></p>', editor.getContent());

    editor.setContent('<a href="/test.html">test</a>');
    Assert.eq('urls - relativeURLs', '<p><a href="../../../test.html">test</a></p>', editor.getContent());

    editor.setContent('<a href="http://www.somesite.com/test/file.htm">test</a>');
    Assert.eq('urls - relativeURLs', '<p><a href="http://www.somesite.com/test/file.htm">test</a></p>', editor.getContent());

    editor.setContent('<a href="//www.site.com/test/file.htm">test</a>');
    Assert.eq('urls - relativeURLs', '<p><a href="../../../test/file.htm">test</a></p>', editor.getContent());

    editor.setContent('<a href="//www.somesite.com/test/file.htm">test</a>');
    Assert.eq('urls - relativeURLs', '<p><a href="//www.somesite.com/test/file.htm">test</a></p>', editor.getContent());
  }));

  const sAbsoluteUrls = (editor: Editor) => Log.step('TBA', 'urls - absoluteURLs', Step.sync(() => {
    editor.settings.relative_urls = false;
    editor.settings.remove_script_host = true;
    editor.documentBaseURI = new URI('http://www.site.com/dirA/dirB/dirC/');

    editor.setContent('<a href="test.html">test</a>');
    Assert.eq('urls - absoluteURLs', '<p><a href="/dirA/dirB/dirC/test.html">test</a></p>', editor.getContent());

    editor.setContent('<a href="../test.html">test</a>');
    Assert.eq('urls - absoluteURLs', '<p><a href="/dirA/dirB/test.html">test</a></p>', editor.getContent());

    editor.setContent('<a href="test/test.html">test</a>');
    Assert.eq('urls - absoluteURLs', '<p><a href="/dirA/dirB/dirC/test/test.html">test</a></p>', editor.getContent());

    editor.setContent('<a href="http://www.somesite.com/test/file.htm">test</a>');
    Assert.eq('urls - absoluteURLs', '<p><a href="http://www.somesite.com/test/file.htm">test</a></p>', editor.getContent());

    editor.settings.relative_urls = false;
    editor.settings.remove_script_host = false;

    editor.setContent('<a href="test.html">test</a>');
    Assert.eq('urls - absoluteURLs', '<p><a href="http://www.site.com/dirA/dirB/dirC/test.html">test</a></p>', editor.getContent());

    editor.setContent('<a href="../test.html">test</a>');
    Assert.eq('urls - absoluteURLs', '<p><a href="http://www.site.com/dirA/dirB/test.html">test</a></p>', editor.getContent());

    editor.setContent('<a href="test/test.html">test</a>');
    Assert.eq('urls - absoluteURLs', '<p><a href="http://www.site.com/dirA/dirB/dirC/test/test.html">test</a></p>', editor.getContent());

    editor.setContent('<a href="http://www.somesite.com/test/file.htm">test</a>');
    Assert.eq('urls - absoluteURLs', '<p><a href="http://www.somesite.com/test/file.htm">test</a></p>', editor.getContent());

    editor.setContent('<a href="//www.site.com/test/file.htm">test</a>');
    Assert.eq('urls - absoluteURLs', '<p><a href="//www.site.com/test/file.htm">test</a></p>', editor.getContent());

    editor.setContent('<a href="//www.somesite.com/test/file.htm">test</a>');
    Assert.eq('urls - absoluteURLs', '<p><a href="//www.somesite.com/test/file.htm">test</a></p>', editor.getContent());
  }));

  const sWebkidSerializationRangeBug = (editor: Editor) => Log.step('TBA', 'WebKit Serialization range bug', Step.sync(() => {
    if (Env.webkit) {
      // Note that if we create the P with this invalid content directly, Chrome cleans it up differently to other browsers so we don't
      // wind up testing the serialization functionality we were aiming for and the test fails.
      const p = editor.dom.create('p', {}, '123<table><tbody><tr><td>X</td></tr></tbody></table>456');
      editor.dom.replace(p, editor.getBody().firstChild);

      Assert.eq('WebKit Serialization range bug', '<p>123</p><table><tbody><tr><td>X</td></tr></tbody></table><p>456</p>', editor.getContent());
    }
  }));

  const sEditorMethodsGetParam = (editor: Editor) => Log.step('TBA', 'editor_methods - getParam', Step.sync(() => {
    editor.settings.test = 'a,b,c';
    Assert.eq('editor_methods - getParam', 'c', editor.getParam('test', '', 'hash').c);

    editor.settings.test = 'a';
    Assert.eq('editor_methods - getParam', 'a', editor.getParam('test', '', 'hash').a);

    editor.settings.test = 'a=b';
    Assert.eq('editor_methods - getParam', 'b', editor.getParam('test', '', 'hash').a);

    editor.settings.test = 'a=b;c=d,e';
    Assert.eq('editor_methods - getParam', 'd,e', editor.getParam('test', '', 'hash').c);

    editor.settings.test = 'a=b,c=d';
    Assert.eq('editor_methods - getParam', 'd', editor.getParam('test', '', 'hash').c);
  }));

  const sSetContent = (editor: Editor) => Log.step('TBA', 'setContent', Step.sync(() => {
    let count;

    const callback = (e) => {
      e.content = e.content.replace(/test/, 'X');
      count++;
    };

    editor.on('SetContent', callback);
    editor.on('BeforeSetContent', callback);
    count = 0;
    editor.setContent('<p>test</p>');
    Assert.eq('setContent', '<p>X</p>', editor.getContent());
    Assert.eq('setContent', 2, count);
    editor.off('SetContent', callback);
    editor.off('BeforeSetContent', callback);

    count = 0;
    editor.setContent('<p>test</p>');
    Assert.eq('setContent', '<p>test</p>', editor.getContent());
    Assert.eq('setContent', 0, count);
  }));

  const sSetContentWithCommentBug = (editor: Editor) => Log.step('TBA', 'setContent with comment bug #4409', Step.sync(() => {
    editor.setContent('<!-- x --><br>');
    editor.settings.disable_nodechange = false;
    editor.nodeChanged();
    editor.settings.disable_nodechange = true;
    Assert.eq('setContent with comment bug #4409', '<!-- x --><p>\u00a0</p>', editor.getContent());
  }));

  const sCustomElements = (editor: Editor) => Log.step('TBA', 'custom elements', Step.sync(() => {
    editor.setContent('<custom1>c1</custom1><custom2>c1</custom2>');
    Assert.eq('custom elements', '<custom1>c1</custom1><p><custom2>c1</custom2></p>', editor.getContent());
  }));

  const sStoreRestoreTabindex = (editor: Editor) => Log.step('TBA', 'Store/restore tabindex', Step.sync(() => {
    editor.setContent('<span tabindex="42">abc</span>');
    Assert.eq('Store/restore tabindex', '<p><span data-mce-tabindex="42">abc</span></p>', editor.getContent({ format: 'raw' }).toLowerCase());
    Assert.eq('Store/restore tabindex', '<p><span tabindex="42">abc</span></p>', editor.getContent());
  }));

  const sShowHideIsHiddenAndEvents = (editor: Editor) => Log.step('TBA', 'show/hide/isHidden and events', Step.sync(() => {
    let lastEvent;

    editor.on('show hide', (e) => {
      lastEvent = e;
    });

    Assert.eq('Initial isHidden state', false, editor.isHidden());

    editor.hide();
    Assert.eq('After hide isHidden state', true, editor.isHidden());
    Assert.eq('show/hide/isHidden and events', 'hide', lastEvent.type);

    lastEvent = null;
    editor.hide();
    Assert.eq('show/hide/isHidden and events', null, lastEvent);

    editor.show();
    Assert.eq('After show isHidden state', false, editor.isHidden());
    Assert.eq('show/hide/isHidden and events', 'show', lastEvent.type);

    lastEvent = null;
    editor.show();
    Assert.eq('show/hide/isHidden and events', null, lastEvent);
  }));

  const sHideSaveContentAndHiddenStateWhileSaving = (editor: Editor) => Log.step('TBA', 'hide save content and hidden state while saving', Step.sync(() => {
    let lastEvent, hiddenStateWhileSaving;

    editor.on('SaveContent', (e) => {
      lastEvent = e;
      hiddenStateWhileSaving = editor.isHidden();
    });

    editor.setContent('xyz');
    editor.hide();

    const elm: any = document.getElementById(editor.id);
    Assert.eq('False isHidden state while saving', false, hiddenStateWhileSaving);
    Assert.eq('hide save content and hidden state while saving', '<p>xyz</p>', lastEvent.content);
    Assert.eq('hide save content and hidden state while saving', '<p>xyz</p>', elm.value);

    editor.show();
  }));

  const sInsertContent = (editor: Editor) => Log.stepsAsStep('', 'insertContent', [
    Step.sync(() => editor.setContent('<p>ab</p>')),
    TinyApis(editor).sSetCursor([ 0, 0 ], 1),
    Step.sync(() => editor.insertContent('c')),
    Step.sync(() => Assert.eq('insertContent', '<p>acb</p>', editor.getContent()))
  ]);

  const sInserContentMerge = (editor: Editor) => Log.stepsAsStep('', 'insertContent merge', [
    Step.sync(() => editor.setContent('<p><strong>a</strong></p>')),
    TinyApis(editor).sSetCursor([ 0, 0 ], 1),
    Step.sync(() => editor.insertContent('<em><strong>b</strong></em>', { merge: true })),
    Step.sync(() => Assert.eq('insertContent merge', '<p><strong>a<em>b</em></strong></p>', editor.getContent()))
  ]);

  const sAddCommand = (editor: Editor) => Log.step('TBA', 'addCommand', Step.sync(() => {
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
    Assert.eq('addCommand', false, lastArgs[0]);
    Assert.eq('addCommand', 'value', lastArgs[1]);
    Assert.eq('addCommand', true, lastScope === scope);

    editor.execCommand('CustomCommand2');
    Assert.eq('addCommand', 'undefined', typeof lastArgs[0]);
    Assert.eq('addCommand', 'undefined', typeof lastArgs[1]);
    Assert.eq('addCommand', true, lastScope === editor);
  }));

  const sAddQuertyStateHandler = (editor: Editor) => Log.step('TBA', 'addQueryStateHandler', Step.sync(() => {
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
    Assert.eq('addQueryStateHandler', false, editor.queryCommandState('CustomCommand1'));
    Assert.eq('Scope is not custom scope', true, lastScope === scope);

    currentState = true;
    Assert.eq('addQueryStateHandler', true, editor.queryCommandState('CustomCommand2'));
    Assert.eq('Scope is not editor', true, lastScope === editor);
  }));

  const sBlockScriptExecution = (editor: Editor) => Log.step('TBA', 'Block script execution', Step.sync(() => {
    editor.setContent('<script></script><script type="x"></script><script type="mce-x"></script><p>x</p>');
    Assert.eq('Block script execution',
      HtmlUtils.cleanHtml(editor.getBody().innerHTML),
      '<script type="mce-no/type"></script>' +
      '<script type="mce-x"></script>' +
      '<script type="mce-x"></script>' +
      '<p>x</p>'
    );
    Assert.eq('Block script execution',
      editor.getContent(),
      '<script></script>' +
      '<script type="x"></script>' +
      '<script type="x"></script>' +
      '<p>x</p>'
    );
  }));

  const sAddQueryValueHandler = (editor: Editor) => Log.step('TBA', 'addQueryValueHandler', Step.sync(() => {
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
    Assert.eq('addQueryValueHandler', 'a', editor.queryCommandValue('CustomCommand1'));
    Assert.eq('Scope is not custom scope', true, lastScope === scope);

    currentValue = 'b';
    Assert.eq('addQueryValueHandler', 'b', editor.queryCommandValue('CustomCommand2'));
    Assert.eq('Scope is not editor', true, lastScope === editor);
  }));

  const sSetDirtyIsDirty = (editor: Editor) => Log.step('TBA', 'setDirty/isDirty', Step.sync(() => {
    let lastArgs = null;

    editor.on('dirty', (e) => {
      lastArgs = e;
    });

    editor.setDirty(false);
    Assert.eq('setDirty/isDirty', null, lastArgs);
    Assert.eq('setDirty/isDirty', false, editor.isDirty());

    editor.setDirty(true);
    Assert.eq('setDirty/isDirty', 'dirty', lastArgs.type);
    Assert.eq('setDirty/isDirty', true, editor.isDirty());

    lastArgs = null;
    editor.setDirty(true);
    Assert.eq('setDirty/isDirty', null, lastArgs);
    Assert.eq('setDirty/isDirty', true, editor.isDirty());

    editor.setDirty(false);
    Assert.eq('setDirty/isDirty', null, lastArgs);
    Assert.eq('setDirty/isDirty', false, editor.isDirty());
  }));

  const sSetMode = (editor: Editor) => Log.step('TBA', 'setMode', Step.sync(() => {
    let clickCount = 0;

    const isDisabled = (selector) => {
      const elm = UiFinder.findIn(SugarBody.body(), selector);
      return elm.forall((elm) => Attribute.has(elm, 'disabled') || Class.has(elm, 'tox-tbtn--disabled'));
    };

    editor.on('click', () => {
      clickCount++;
    });

    editor.dom.fire(editor.getBody(), 'click');
    Assert.eq('setMode', 1, clickCount);

    editor.setMode('readonly');
    Assert.eq('setMode', true, isDisabled('.tox-editor-container button:last'));
    editor.dom.fire(editor.getBody(), 'click');
    Assert.eq('setMode', 1, clickCount);

    editor.setMode('design');
    editor.dom.fire(editor.getBody(), 'click');
    Assert.eq('setMode', false, isDisabled('.tox-editor-container button:last'));
    Assert.eq('setMode', 2, clickCount);
  }));

  const sTranslate = (editor: Editor) => Log.step('TBA', 'translate', Step.sync(() => {
    EditorManager.addI18n('en', {
      'input i18n': 'output i18n',
      'value:{0}{1}': 'value translation:{0}{1}'
    });

    Assert.eq('translate', 'output i18n', editor.translate('input i18n'));
    Assert.eq('translate', 'value translation:ab', editor.translate([ 'value:{0}{1}', 'a', 'b' ]));
  }));

  const sTreatSomeParagraphsAsEmptyContents = (editor: Editor) => Log.step('TBA', 'Treat some paragraphs as empty contents', Step.sync(() => {
    editor.setContent('<p><br /></p>');
    Assert.eq('Treat some paragraphs as empty contents', '', editor.getContent());

    editor.setContent('<p>\u00a0</p>');
    Assert.eq('Treat some paragraphs as empty contents', '', editor.getContent());
  }));

  const sKamerWordBoundaries = (editor: Editor) => Log.step('TBA', 'kamer word boundaries', Step.sync(() => {
    editor.setContent('<p>!\u200b!\u200b!</p>');
    Assert.eq('kamer word boundaries', '<p>!\u200b!\u200b!</p>', editor.getContent());
  }));

  const sPreserveWhitespacePreElements = (editor: Editor) => Log.step('TBA', 'Preserve whitespace pre elements', Step.sync(() => {
    editor.setContent('<pre> </pre>');
    Assert.eq('kamer word boundaries', '<pre> </pre>', editor.getContent());
  }));

  const sHasFocus = (editor: Editor) => Log.step('TBA', 'hasFocus', Step.sync(() => {
    editor.focus();
    Assert.eq('hasFocus', true, editor.hasFocus());

    const input = document.createElement('input');
    document.body.appendChild(input);

    input.focus();
    Assert.eq('hasFocus', false, editor.hasFocus());

    editor.focus();
    Assert.eq('hasFocus', true, editor.hasFocus());

    input.parentNode.removeChild(input);
  }));

  const sHasPlugin = (editor: Editor) => {
    const sCheckWithoutManager = (title: string, plugins: string, plugin: string, expected: boolean) => Step.sync(() => {
      editor.settings.plugins = plugins;
      Assert.eq(title, expected, editor.hasPlugin(plugin));
    });

    const sCheckWithManager = (title: string, plugins: string, plugin: string, addToManager: boolean, expected: boolean) => Step.sync(() => {
      if (addToManager) {
        PluginManager.add('ParticularPlugin', () => {});
      }

      editor.settings.plugins = plugins;
      Assert.eq(title, editor.hasPlugin(plugin, true), expected);

      if (addToManager) {
        PluginManager.remove('ParticularPlugin');
      }
    });

    return Log.stepsAsStep('TINY-766', 'hasPlugin',
      [
        Log.stepsAsStep('TINY-766', 'Checking without requiring a plugin to be loaded', [
          sCheckWithoutManager('Plugin does not exist', 'Plugin Is Not Here', 'ParticularPlugin', false),
          sCheckWithoutManager('Plugin does exist with spaces', 'Has ParticularPlugin In List', 'ParticularPlugin', true),
          sCheckWithoutManager('Plugin does exist with commas', 'Has,ParticularPlugin,In,List', 'ParticularPlugin', true),
          sCheckWithoutManager('Plugin does exist with spaces and commas', 'Has, ParticularPlugin, In, List', 'ParticularPlugin', true),
          sCheckWithoutManager('Plugin does not patch to OtherPlugin', 'Has OtherPlugin In List', 'Plugin', false)
        ]),

        Log.stepsAsStep('TINY-766', 'Checking while requiring a plugin to be loaded', [
          sCheckWithManager('Plugin does not exist', 'Plugin Is Not Here', 'ParticularPlugin', true, false),
          sCheckWithManager('Plugin does exist with spaces', 'Has ParticularPlugin In List', 'ParticularPlugin', true, true),
          sCheckWithManager('Plugin does exist with commas', 'Has,ParticularPlugin,In,List', 'ParticularPlugin', true, true),
          sCheckWithManager('Plugin does exist with spaces and commas', 'Has, ParticularPlugin, In, List', 'ParticularPlugin', true, true),
          sCheckWithManager('Plugin does not patch to OtherPlugin', 'Has OtherPlugin In List', 'Plugin', true, false),
          sCheckWithManager('Plugin which has not loaded does not return true', 'Has ParticularPlugin In List', 'ParticularPlugin', false, false)
        ])
      ]
    );
  };

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    Pipeline.async({},
      [
        sEventChange(editor),
        sEventBeforeExecCommand(editor),
        sRelativeUrls(editor),
        sAbsoluteUrls(editor),
        sWebkidSerializationRangeBug(editor),
        sEditorMethodsGetParam(editor),
        sSetContent(editor),
        sSetContentWithCommentBug(editor),
        sCustomElements(editor),
        sStoreRestoreTabindex(editor),
        sShowHideIsHiddenAndEvents(editor),
        sHideSaveContentAndHiddenStateWhileSaving(editor),
        sInsertContent(editor),
        sInserContentMerge(editor),
        sAddCommand(editor),
        sAddQuertyStateHandler(editor),
        sBlockScriptExecution(editor),
        sAddQueryValueHandler(editor),
        sSetDirtyIsDirty(editor),
        sSetMode(editor),
        sTranslate(editor),
        sTreatSomeParagraphsAsEmptyContents(editor),
        sKamerWordBoundaries(editor),
        sPreserveWhitespacePreElements(editor),
        sHasFocus(editor),
        sHasPlugin(editor)
      ],
      onSuccess, onFailure);
  }, {
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    custom_elements: 'custom1,~custom2',
    extended_valid_elements: 'custom1,custom2,script[*]',
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
