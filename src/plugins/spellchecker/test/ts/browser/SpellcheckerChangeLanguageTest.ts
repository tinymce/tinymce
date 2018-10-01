import { Pipeline, RawAssertions, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import SpellcheckerPlugin from 'tinymce/plugins/spellchecker/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.spellchecker.SpellcheckerChangeLanguageTest', (success, failure) => {
  Theme();
  SpellcheckerPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      tinyUi.sClickOnToolbar('click caret', 'div[aria-label="Spell check"] i.mce-caret'),
      tinyUi.sClickOnUi('click german', 'span:contains("German")'),
      Step.sync(() => RawAssertions.assertEq('should be "de"', 'de', editor.plugins.spellchecker.getLanguage()))
    ], onSuccess, onFailure);
  }, {
    plugins: 'spellchecker',
    toolbar: 'spellchecker',
    spellchecker_languages: 'English=en,French=fr,German=de',
    skin_url: '/project/js/tinymce/skins/oxide'
  }, success, failure);
});
