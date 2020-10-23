import { Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import SpellcheckerPlugin from 'tinymce/plugins/spellchecker/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.spellchecker.SpellcheckerChangeLanguageTest', (success, failure) => {

  SpellcheckerPlugin();
  SilverTheme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);

    Pipeline.async({}, Log.steps('TBA', 'Spellchecker: Change language test', [
      ui.sClickOnToolbar('Click spelling', 'span.tox-split-button__chevron'),
      ui.sWaitForUi('Wait for menu', '.tox-collection__item-label:contains("German")'),
      ui.sClickOnUi('click german', '.tox-collection__item-label:contains("German")'),
      Step.sync(() => Assert.eq('should be "de"', 'de', editor.plugins.spellchecker.getLanguage()))
    ]), onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'spellchecker',
    toolbar: 'spellchecker',
    spellchecker_languages: 'English=en,French=fr,German=de',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
