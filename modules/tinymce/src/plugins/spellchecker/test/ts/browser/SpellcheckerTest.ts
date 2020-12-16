import { Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import * as Settings from 'tinymce/plugins/spellchecker/api/Settings';
import SpellcheckerPlugin from 'tinymce/plugins/spellchecker/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.spellchecker.SpellcheckerTest', (success, failure) => {

  SilverTheme();
  SpellcheckerPlugin();

  const sTestDefaultLanguage = (editor) => {
    return Step.sync(() => {
      Assert.eq('should be same', Settings.getLanguage(editor), 'en');
    });
  };

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const ui = TinyUi(editor);
    Pipeline.async({}, Log.steps('TBA', 'Spellchecker: default settings', [
      sTestDefaultLanguage(editor),
      ui.sWaitForUi('my button', '.tox-split-button')
    ]), onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'spellchecker',
    toolbar: 'spellchecker',
    base_url: '/project/tinymce/js/tinymce',
    statusbar: false
  }, success, failure);
});
