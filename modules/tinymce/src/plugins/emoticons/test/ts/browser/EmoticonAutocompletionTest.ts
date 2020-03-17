import { Keyboard, Keys, Log, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Body, Element } from '@ephox/sugar';
import EmoticonsPlugin from 'tinymce/plugins/emoticons/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.emoticons.AutocompletionTest', (success, failure) => {

  EmoticonsPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const eDoc = Element.fromDom(editor.getDoc());

    // NOTE: This is almost identical to charmap
    Pipeline.async({},
      Log.steps('TBA', 'Emoticons: Autocomplete, trigger an autocomplete and check it appears', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('<p>:ha</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 3),
        Keyboard.sKeypress(eDoc, 'a'.charCodeAt(0), { }),
        UiFinder.sWaitForVisible('Waiting for autocomplete menu', Body.body(), '.tox-autocompleter .tox-collection__item'),
        Keyboard.sKeydown(eDoc, Keys.right(), { }),
        Keyboard.sKeydown(eDoc, Keys.right(), { }),
        Keyboard.sKeydown(eDoc, Keys.enter(), { }),
        tinyApis.sAssertContent('<p>😂</p>')
      ])
      , onSuccess, onFailure);
  }, {
    plugins: 'emoticons',
    toolbar: 'emoticons',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    emoticons_database_url: '/project/tinymce/src/plugins/emoticons/test/js/test-emojis.js',
    emoticons_database_id: 'tinymce.plugins.emoticons.test-emojis.js'
  }, success, failure);
});
