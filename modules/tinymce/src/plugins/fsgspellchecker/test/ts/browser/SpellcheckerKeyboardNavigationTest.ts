import { FocusTools, Keyboard, Keys, Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyLoader } from '@ephox/wrap-mcagar';

import Tools from 'tinymce/core/api/util/Tools';
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
    const doc = SugarElement.fromDom(document);

    const sPressTab = Keyboard.sKeydown(doc, Keys.tab(), {});
    const sPressEsc = Keyboard.sKeydown(doc, Keys.escape(), {});
    const sPressDown = Keyboard.sKeydown(doc, Keys.down(), {});
    const sPressRight = Keyboard.sKeydown(doc, Keys.right(), {});

    const sFocusToolbar = Step.sync(() => {
      const args = Tools.extend({
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false
      }, { altKey: true, keyCode: 120 });
      editor.dispatch('keydown', args);
    });

    const sAssertFocused = (name: string, selector: string) => FocusTools.sTryOnSelector(name, doc, selector);

    Pipeline.async({}, Log.steps('TBA', 'fsgspellchecker: Reaching the spellchecker via the keyboard', [
      sTestDefaultLanguage(editor),
      sFocusToolbar,
      sAssertFocused('File', '.tox-mbtn:contains("File")'),
      sPressRight,
      sAssertFocused('Edit', '.tox-mbtn:contains("Edit")'),
      sPressRight,
      sAssertFocused('View', '.tox-mbtn:contains("View")'),
      sPressRight,
      sAssertFocused('Format', '.tox-mbtn:contains("Format")'),
      sPressRight,
      sAssertFocused('Tools', '.tox-mbtn:contains("Tools")'),
      sPressDown,
      sAssertFocused('Spellcheck tool menu item', '.tox-collection__item:contains("Spellcheck")'), // Menu item can be reached by keyboard
      sPressEsc,
      sPressTab,
      sAssertFocused('Spellchecker button', '.tox-split-button'), // Button can be reached by keyboard
      sPressDown,
      sAssertFocused('First language', '.tox-collection__item:contains("English")') // Languages can be reached by keyboard
    ]), onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'fsgspellchecker',
    toolbar: 'fsgspellchecker',
    base_url: '/project/tinymce/js/tinymce',
    statusbar: false,
    spellchecker_callback: (method: string, _text: any/*noImplicitAny*/, success: any/*noImplicitAny*/, _failure: any/*noImplicitAny*/) => {
      if (method === 'spellcheck') {
        success({ words: {
          helo: [ 'hello' ],
          worl: [ 'world' ]
        }});
      }
    }
  }, success, failure);
});
