import { Assertions, GeneralSteps, Keyboard, Keys, Pipeline, Step, Waiter, Logger, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Plugin from 'tinymce/plugins/wordcount/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.wordcount.PluginTest', (success, failure) => {

  Plugin(2);
  Theme();

  const sReset = function (tinyApis: TinyApis) {
    return Logger.t('Reset content', GeneralSteps.sequence([
      tinyApis.sSetContent(''),
      sWaitForWordcount(0)
    ]));
  };

  const sAssertWordcount = function (num: number) {
    return Logger.t(`Assert word count ${num}`, Step.sync(function () {
      const countEl = DOMUtils.DOM.select('.tox-statusbar__wordcount')[0];
      const value = countEl ? countEl.innerText : '';
      Assertions.assertEq('wordcount', num + ' WORDS', value.toUpperCase());
    }));
  };

  const sAssertContent = (tinyApis: TinyApis, expected: string) => {
    return GeneralSteps.sequence(Log.steps('TBA', 'asserting contents after undo', [
      tinyApis.sAssertContent(expected)
    ]));
  };

  const sWaitForWordcount = function (num: number) {
    return Waiter.sTryUntil('wordcount did not change', sAssertWordcount(num));
  };

  const sFakeTyping = function (editor: Editor, str: string) {
    return Logger.t(`Fake typing ${str}`, Step.sync(function () {
      editor.getBody().innerHTML = '<p>' + str + '</p>';
      Keyboard.keystroke(Keys.space(), {}, TinyDom.fromDom(editor.getBody()));
    }));
  };

  const sTestSetContent = function (tinyApis: TinyApis) {
    return GeneralSteps.sequence(Log.steps('TBA', 'WordCount: Set test content and assert word count', [
      sReset(tinyApis),
      tinyApis.sSetContent('<p>hello world</p>'),
      sWaitForWordcount(2)
    ]));
  };

  const sTestKeystroke = function (editor: Editor, tinyApis: TinyApis) {
    return GeneralSteps.sequence(Log.steps('TBA', 'WordCount: Test keystroke and assert word count', [
      sReset(tinyApis),
      sFakeTyping(editor, 'a b c'),
      sWaitForWordcount(3)
    ]));
  };

  const sExecCommand = function (editor: Editor, command: string) {
    return Logger.t(`Execute ${command}`, Step.sync(function () {
      editor.execCommand(command);
    }));
  };

  const sTestUndoRedo = function (editor: Editor, tinyApis: TinyApis) {
    return GeneralSteps.sequence(Log.steps('TBA', 'WordCount: Test undo and redo', [
      sReset(tinyApis),
      tinyApis.sSetContent('<p>a b c</p>'),
      sWaitForWordcount(3),
      sExecCommand(editor, 'undo'),
      sAssertContent(tinyApis, ''),
      sWaitForWordcount(0),
      sExecCommand(editor, 'redo'),
      sAssertContent(tinyApis, '<p>a b c</p>'),
      sWaitForWordcount(3),
      tinyApis.sSetRawContent('<p>hello world</p>'),
      sExecCommand(editor, 'mceAddUndoLevel'),
      sWaitForWordcount(2)
    ]));
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      sTestSetContent(tinyApis),
      sTestKeystroke(editor, tinyApis),
      sTestUndoRedo(editor, tinyApis)
    ], onSuccess, onFailure);
  }, {
    plugins: 'wordcount',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
