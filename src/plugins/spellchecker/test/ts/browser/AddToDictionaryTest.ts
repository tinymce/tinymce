import { Pipeline, RawAssertions, Step, Chain, UiFinder, Mouse, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyApis, TinyUi } from '@ephox/mcagar';

import SpellcheckerPlugin from 'tinymce/plugins/spellchecker/Plugin';
import 'tinymce/themes/silver/Theme';
import { Element, Body } from '@ephox/sugar';

UnitTest.asynctest('browser.tinymce.plugins.spellchecker.AddToDictionaryTest', (success, failure) => {

  SpellcheckerPlugin();

  const dict = [];

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const api = TinyApis(editor);
    const ui = TinyUi(editor);

    Pipeline.async({}, Log.steps('TBA', 'Spellchecker: Add a new word to dictionary', [
      api.sFocus,
      api.sSetContent('<p>hello world</p>'),
      ui.sClickOnToolbar('click spellcheck button', '[title="Spellcheck"] > .tox-tbtn'),
      api.sSetCursor([ 0, 0, 0 ], 0),
      Chain.asStep(Element.fromDom(editor.getBody()), [
        UiFinder.cFindIn('span:contains("hello")'),
        Mouse.cContextMenu
      ]),
      Chain.asStep(Body.body(), [
        UiFinder.cWaitFor('wait for context menu', 'div[role="menu"]'),
        UiFinder.cFindIn('span:contains("Add to dictionary")'),
        Mouse.cClick
      ]),
      Step.sync(() => RawAssertions.assertEq('dict should now have hello', ['hello'], dict))
    ]), onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'spellchecker',
    toolbar: 'spellchecker',
    spellchecker_languages: 'English=en,French=fr,German=de',
    base_url: '/project/js/tinymce',
    spellchecker_callback(method, text, success, failure) {
      if (method === 'spellcheck') {
        success({dictionary: dict, words: {hello: ['word1'], world: ['word2']}});
      } else if (method === 'addToDictionary') {
        dict.push(text);
        success();
      }
    }
  }, success, failure);
});
