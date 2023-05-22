import { Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi } from '@ephox/wrap-mcagar';

import * as Options from 'tinymce/plugins/fsgspellchecker/api/Options';
import SpellcheckerPlugin from 'tinymce/plugins/fsgspellchecker/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.fsgspellchecker.SpellcheckerTest', (success, failure) => {

  SilverTheme();
  SpellcheckerPlugin();

  const sTestDefaultLanguage = (editor: any/*noImplicitAny*/) => {
    return Step.sync(() => {
      Assert.eq('should be same', Options.getLanguage(editor), 'en');
    });
  };

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const ui = TinyUi(editor);
    Pipeline.async({}, Log.steps('TBA', 'fsgspellchecker: default Options', [
      sTestDefaultLanguage(editor),
      ui.sWaitForUi('my button', '.tox-split-button')
    ]), onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'fsgspellchecker',
    toolbar: 'fsgspellchecker',
    base_url: '/project/tinymce/js/tinymce',
    statusbar: false
  }, success, failure);
});
