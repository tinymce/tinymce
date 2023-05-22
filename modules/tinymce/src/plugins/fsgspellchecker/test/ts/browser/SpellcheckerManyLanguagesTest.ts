import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi } from '@ephox/wrap-mcagar';

import SpellcheckerPlugin from 'tinymce/plugins/fsgspellchecker/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.fsgspellchecker.SpellcheckerTest', (success, failure) => {

  SpellcheckerPlugin();
  SilverTheme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const ui = TinyUi(editor);

    Pipeline.async({}, Log.steps('TBA', 'fsgspellchecker: Multiple languages split button', [
      ui.sWaitForUi('my button', '.tox-split-button')
    ]), onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'fsgspellchecker',
    toolbar: 'fsgspellchecker',
    spellchecker_languages: 'English=en,French=fr,German=de',
    base_url: '/project/tinymce/js/tinymce',
    statusbar: false
  }, success, failure);
});
