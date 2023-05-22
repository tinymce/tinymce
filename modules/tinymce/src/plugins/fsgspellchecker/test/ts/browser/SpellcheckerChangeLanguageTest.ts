import { Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi } from '@ephox/wrap-mcagar';

import SpellcheckerPlugin from 'tinymce/plugins/fsgspellchecker/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.fsgspellchecker.SpellcheckerChangeLanguageTest', (success, failure) => {

  SpellcheckerPlugin();
  SilverTheme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const ui = TinyUi(editor);

    Pipeline.async({}, Log.steps('TBA', 'fsgspellchecker: Change language test', [
      ui.sClickOnToolbar('Click spelling', 'span.tox-split-button__chevron'),
      ui.sWaitForUi('Wait for menu', '.tox-collection__item-label:contains("German")'),
      ui.sClickOnUi('click german', '.tox-collection__item-label:contains("German")'),
      Step.sync(() => Assert.eq('should be "de"', 'de', editor.plugins.fsgspellchecker.getLanguage()))
    ]), onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'fsgspellchecker',
    toolbar: 'fsgspellchecker',
    spellchecker_languages: 'English=en,French=fr,German=de',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
