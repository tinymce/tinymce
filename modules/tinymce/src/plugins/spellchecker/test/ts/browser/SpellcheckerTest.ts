import { Pipeline, RawAssertions, Step, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import Settings from 'tinymce/plugins/spellchecker/api/Settings';
import SpellcheckerPlugin from 'tinymce/plugins/spellchecker/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.spellchecker.SpellcheckerTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  SilverTheme();
  SpellcheckerPlugin();

  const sTestDefaultLanguage = function (editor) {
    return Step.sync(function () {
      RawAssertions.assertEq('should be same', Settings.getLanguage(editor), 'en');
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);
    Pipeline.async({}, Log.steps('TBA', 'Spellchecker: default settings', [
      sTestDefaultLanguage(editor),
      ui.sWaitForUi('my button', '.tox-split-button'),
    ]), onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'spellchecker',
    toolbar: 'spellchecker',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
