import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import SpellcheckerPlugin from 'tinymce/plugins/spellchecker/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.spellchecker.SpellcheckerSpanClassTest', (success, failure) => {

  SpellcheckerPlugin();
  SilverTheme();

  const dict = [];

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const api = TinyApis(editor);
    const ui = TinyUi(editor);

    Pipeline.async({}, [
      api.sFocus(),
      Log.stepsAsStep('TBA', 'Spellchecker: Spelling marks should not reuse existing span. Spelling marks will be nested inside existing spans', [
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
        }),
        ui.sClickOnToolbar('click spellcheck button', '[title="Spellcheck"] > .tox-tbtn')
      ]),
      Log.stepsAsStep('TBA', 'Spellchecker: Spelling marks should keep selection/content when wrapping', [
        api.sSetContent('<p>hello <strong>bold</strong> world</p>'),
        api.sSetCursor([ 0, 1, 0 ], 2),
        ui.sClickOnToolbar('click spellcheck button', '[title="Spellcheck"] > .tox-tbtn'),
        api.sAssertContentPresence({
          'strong.mce-spellchecker-word': 0,
          'strong': 1,
          'strong > .mce-spellchecker-word': 2, // Span split because of selection bookmark
          '.mce-spellchecker-word': 4
        }),
        api.sAssertSelection([ 0, 2 ], 2, [ 0, 2 ], 2),
        api.sAssertContent('<p>hello <strong>bold</strong> world</p>'),
        ui.sClickOnToolbar('click spellcheck button', '[title="Spellcheck"] > .tox-tbtn')
      ]),
      Log.stepsAsStep('TBA', 'Spellchecker: Spelling marks should keep selection/content unwrap', [
        api.sSetContent('<p>hello <strong>bold</strong> world</p>'),
        ui.sClickOnToolbar('click spellcheck button', '[title="Spellcheck"] > .tox-tbtn'),
        api.sAssertContentPresence({
          'strong.mce-spellchecker-word': 0,
          'strong': 1,
          'strong > .mce-spellchecker-word': 1,
          '.mce-spellchecker-word': 3
        }),
        api.sSetCursor([ 0, 2, 0, 0 ], 2),
        ui.sClickOnToolbar('click spellcheck button', '[title="Spellcheck"] > .tox-tbtn'),
        api.sAssertContentPresence({
          'strong': 1,
          '.mce-spellchecker-word': 0
        }),
        api.sAssertContent('<p>hello <strong>bold</strong> world</p>'),
        api.sAssertSelection([ 0, 2, 0 ], 2, [ 0, 2, 0 ], 2)
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'spellchecker',
    toolbar: 'spellchecker',
    spellchecker_languages: 'English=en,French=fr,German=de',
    base_url: '/project/tinymce/js/tinymce',
    spellchecker_callback(method, text, success, _failure) {
      if (method === 'spellcheck') {
        success({ dictionary: dict, words: { hello: [ 'word1' ], world: [ 'word2' ], bold: [ 'word3' ] }});
      } else if (method === 'addToDictionary') {
        dict.push(text);
        success();
      }
    },
    statusbar: false
  }, success, failure);
});
