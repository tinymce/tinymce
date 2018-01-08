import { Assertions } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Keyboard } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { Waiter } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyDom } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import DOMUtils from 'tinymce/core/dom/DOMUtils';
import Plugin from 'tinymce/plugins/wordcount/Plugin';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.wordcount.PluginTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  var sReset = function (tinyApis) {
    return GeneralSteps.sequence([
      tinyApis.sSetContent(''),
      sWaitForWordcount(0)
    ], 0);
  };

  var sAssertWordcount = function (num) {
    return Step.sync(function () {
      var countEl = DOMUtils.DOM.select('.mce-wordcount')[0];
      var value = countEl ? countEl.innerText : '';
      Assertions.assertEq('wordcount', num + ' WORDS', value.toUpperCase());
    });
  };

  var sWaitForWordcount = function (num) {
    return Waiter.sTryUntil('wordcount did not change', sAssertWordcount(num), 100, 3000);
  };

  var sFakeTyping = function (editor, str) {
    return Step.sync(function () {
      editor.getBody().innerHTML = '<p>' + str + '</p>';
      Keyboard.keystroke(Keys.space(), {}, TinyDom.fromDom(editor.getBody()));
    });
  };

  var sTestSetContent = function (tinyApis) {
    return GeneralSteps.sequence([
      sReset(tinyApis),
      tinyApis.sSetContent('<p>hello world</p>'),
      sWaitForWordcount(2)
    ], 0);
  };

  var sTestKeystroke = function (editor, tinyApis) {
    return GeneralSteps.sequence([
      sReset(tinyApis),
      sFakeTyping(editor, 'a b c'),
      sAssertWordcount(0),
      sWaitForWordcount(3)
    ], 0);
  };

  var sExecCommand = function (editor, command) {
    return Step.sync(function () {
      editor.execCommand(command);
    });
  };

  var sSetRawContent = function (editor, content) {
    return Step.sync(function () {
      editor.getBody().innerHTML = content;
    });
  };

  var sTestUndoRedo = function (editor, tinyApis) {
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
    var tinyApis = TinyApis(editor);

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

