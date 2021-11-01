import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi } from '@ephox/wrap-mcagar';

import SpellcheckerPlugin from 'tinymce/plugins/spellchecker/Plugin';

UnitTest.asynctest('browser.tinymce.plugins.spellchecker.SpellcheckerTest', (success, failure) => {

  SpellcheckerPlugin();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const ui = TinyUi(editor);

    Pipeline.async({}, Log.steps('TBA', 'Spellchecker: Multiple languages split button', [
      ui.sWaitForUi('my button', '.tox-split-button')
    ]), onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'spellchecker',
    toolbar: 'spellchecker',
    spellchecker_languages: 'English=en,French=fr,German=de',
    base_url: '/project/tinymce/js/tinymce',
    statusbar: false
  }, success, failure);
});
