import { Chain, Log, Mouse, Pipeline, Step, UiFinder } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { SugarBody, SugarElement } from '@ephox/sugar';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/wrap-mcagar';

import SpellcheckerPlugin from 'tinymce/plugins/fsgspellchecker/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.fsgspellchecker.AddToDictionaryTest', (success, failure) => {

  SpellcheckerPlugin();
  SilverTheme();

  const dict: any[]/*noImplicitAny*/ = [];

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const api = TinyApis(editor);
    const ui = TinyUi(editor);

    Pipeline.async({}, Log.steps('TBA', 'fsgspellchecker: Add a new word to dictionary', [
      api.sFocus(),
      api.sSetContent('<p>hello world</p>'),
      ui.sClickOnToolbar('click spellcheck button', '[title="Spellcheck"] > .tox-tbtn'),
      api.sSetCursor([ 0, 0, 0 ], 0),
      Chain.asStep(SugarElement.fromDom(editor.getBody()), [
        UiFinder.cFindIn('span:contains("hello")'),
        Mouse.cContextMenu
      ]),
      Chain.asStep(SugarBody.body(), [
        UiFinder.cWaitFor('wait for context menu', 'div[role="menu"]'),
        UiFinder.cFindIn('.tox-collection__item-label:contains("Add to dictionary")'),
        Mouse.cClick
      ]),
      Step.sync(() => Assert.eq('dict should now have hello', [ 'hello' ], dict))
    ]), onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'fsgspellchecker',
    toolbar: 'fsgspellchecker',
    spellchecker_languages: 'English=en,French=fr,German=de',
    base_url: '/project/tinymce/js/tinymce',
    spellchecker_callback: (method: string, text: any/*noImplicitAny*/, success: any/*noImplicitAny*/, _failure: any/*noImplicitAny*/) => {
      if (method === 'spellcheck') {
        success({ dictionary: dict, words: { hello: [ 'word1' ], world: [ 'word2' ] }});
      } else if (method === 'addToDictionary') {
        dict.push(text);
        success();
      }
    }
  }, success, failure);
});
