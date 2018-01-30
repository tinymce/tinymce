import { Assertions, GeneralSteps, Keyboard, Keys, Pipeline, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Plugin from 'tinymce/plugins/wordcount/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.wordcount.PluginTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  const sReset = function (tinyApis) {
    return GeneralSteps.sequence([
      tinyApis.sSetContent(''),
      sWaitForWordcount(0)
    ], 0);
  };

  const sAssertWordcount = function (num) {
    return Step.sync(function () {
      const countEl = DOMUtils.DOM.select('.mce-wordcount')[0];
      const value = countEl ? countEl.innerText : '';
      Assertions.assertEq('wordcount', num + ' WORDS', value.toUpperCase());
    });
  };

  const sWaitForWordcount = function (num) {
    return Waiter.sTryUntil('wordcount did not change', sAssertWordcount(num), 100, 3000);
  };

  const sFakeTyping = function (editor, str) {
    return Step.sync(function () {
      editor.getBody().innerHTML = '<p>' + str + '</p>';
      Keyboard.keystroke(Keys.space(), {}, TinyDom.fromDom(editor.getBody()));
    });
  };

  const sTestSetContent = function (tinyApis) {
    return GeneralSteps.sequence([
      sReset(tinyApis),
      tinyApis.sSetContent('<p>hello world</p>'),
      sWaitForWordcount(2)
    ], 0);
  };

  const sTestKeystroke = function (editor, tinyApis) {
    return GeneralSteps.sequence([
      sReset(tinyApis),
      sFakeTyping(editor, 'a b c'),
      sAssertWordcount(0),
      sWaitForWordcount(3)
    ], 0);
  };

  const sExecCommand = function (editor, command) {
    return Step.sync(function () {
      editor.execCommand(command);
    });
  };

  const sSetRawContent = function (editor, content) {
    return Step.sync(function () {
      editor.getBody().innerHTML = content;
    });
  };

  const sTestUndoRedo = function (editor, tinyApis) {
    return GeneralSteps.sequence([
      sReset(tinyApis),
      tinyApis.sSetContent('<p>a b c</p>'),
      sWaitForWordcount(3),
      sExecCommand(editor, 'undo'),
      sWaitForWordcount(0),
      sExecCommand(editor, 'redo'),
      sWaitForWordcount(3),
      sSetRawContent(editor, '<p>hello world</p>'),
      sExecCommand(editor, 'mceAddUndoLevel'),
      sWaitForWordcount(2)
    ], 0);
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
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
