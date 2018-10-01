import 'tinymce/themes/silver/Theme';

import { Keyboard, Keys, Log, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Body, Element } from '@ephox/sugar';
import EmoticonsPlugin from 'tinymce/plugins/emoticons/Plugin';

UnitTest.asynctest('browser.tinymce.plugins.emoticons.AutocompletionTest', (success, failure) => {

  EmoticonsPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const eDoc = Element.fromDom(editor.getDoc());

    // NOTE: This is almost identical to charmap
    Pipeline.async({},
      Log.steps('TBA', 'Emoticons: Autocomplete, trigger an autocomplete and check it appears', [
        tinyApis.sFocus,
        tinyApis.sSetContent('<p>:</p>'),
        tinyApis.sSetCursor([ 0, 0 ], ':'.length),
        Keyboard.sKeypress(eDoc, ':'.charCodeAt(0), { }),
        UiFinder.sWaitForVisible('Waiting for autocomplete menu', Body.body(), '.tox-autocompleter .tox-collection__item'),
        Keyboard.sKeydown(eDoc, Keys.down(), { }),
        Keyboard.sKeydown(eDoc, Keys.right(), { }),
        Keyboard.sKeydown(eDoc, Keys.right(), { }),
        Keyboard.sKeydown(eDoc, Keys.right(), { }),
        Keyboard.sKeydown(eDoc, Keys.right(), { }),
        Keyboard.sKeydown(eDoc, Keys.enter(), { }),
        tinyApis.sAssertContent('<p>😀</p>')
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'emoticons',
    toolbar: 'emoticons',
    theme: 'silver',
    skin_url: '/project/js/tinymce/skins/oxide',
    emoticons_database_url: '/project/src/plugins/emoticons/test/json/test-emojis.js'
  }, success, failure);
});
