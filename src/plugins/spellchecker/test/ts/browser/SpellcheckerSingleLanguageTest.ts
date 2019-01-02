import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import SpellcheckerPlugin from 'tinymce/plugins/spellchecker/Plugin';
import 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.spellchecker.SpellcheckerTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  SpellcheckerPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);

    Pipeline.async({}, Log.steps('TBA', 'Spellchecker: Single language normal button', [
      ui.sWaitForUi('my button', '.tox-tbtn'),
    ]), onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'spellchecker',
    toolbar: 'spellchecker',
    spellchecker_languages: 'English=en',
    base_url: '/project/js/tinymce'
  }, success, failure);
});
