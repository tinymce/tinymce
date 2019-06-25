import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyApis, TinyUi } from '@ephox/mcagar';

import SpellcheckerPlugin from 'tinymce/plugins/spellchecker/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.spellchecker.SpellcheckerSpanClassTest', (success, failure) => {

  SpellcheckerPlugin();
  SilverTheme();

  const dict = [];

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const api = TinyApis(editor);
    const ui = TinyUi(editor);

    Pipeline.async({}, Log.steps('TBA', 'Spellchecker: Spelling marks should not reuse existing span. Spelling marks will be nested inside existing spans', [
      api.sFocus,
      api.sSetContent('<p>hello <span class="bold">bold</span> world</p>'),
      api.sAssertContentPresence({
        span: 1
      }),
      ui.sClickOnToolbar('click spellcheck button', '[title="Spellcheck"] > .tox-tbtn'),
      api.sAssertContentPresence({
        'span': 4,
        '.bold.mce-spellchecker-word': 0,
        '.bold > .mce-spellchecker-word': 1,
        '.mce-spellchecker-word': 3
      })
    ]), onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'spellchecker',
    toolbar: 'spellchecker',
    spellchecker_languages: 'English=en,French=fr,German=de',
    base_url: '/project/tinymce/js/tinymce',
    spellchecker_callback(method, text, success, failure) {
      if (method === 'spellcheck') {
        success({dictionary: dict, words: {hello: ['word1'], world: ['word2'], bold: ['word3']}});
      } else if (method === 'addToDictionary') {
        dict.push(text);
        success();
      }
    }
  }, success, failure);
});
