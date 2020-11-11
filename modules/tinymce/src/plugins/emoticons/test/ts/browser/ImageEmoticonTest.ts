import { Assertions, Chain, FocusTools, Keyboard, Keys, Log, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Attribute, SugarBody, SugarDocument, SugarElement } from '@ephox/sugar';

import EmoticonsPlugin from 'tinymce/plugins/emoticons/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { cFakeEvent } from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.emoticons.ImageEmoticonTest', (success, failure) => {
  EmoticonsPlugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const doc = SugarDocument.getDocument();

    Pipeline.async({},
      Log.steps('TBA', 'Emoticons: Open dialog, Search for "dog", Dog should be first option', [
        tinyApis.sFocus(),
        tinyUi.sClickOnToolbar('click emoticons', 'button'),
        tinyUi.sWaitForPopup('wait for popup', 'div[role="dialog"]'),
        FocusTools.sTryOnSelector('Focus should start on input', doc, 'input'),
        FocusTools.sSetActiveValue(doc, 'dog'),
        Chain.asStep(doc, [
          FocusTools.cGetFocused,
          cFakeEvent('input')
        ]),
        Waiter.sTryUntil(
          'Wait until dog is the first choice (search should filter)',
          Chain.asStep(SugarBody.body(), [
            UiFinder.cFindIn('.tox-collection__item:first'),
            Chain.mapper((item) => {
              const attr = Attribute.get(item, 'data-collection-item-value');
              const img = SugarElement.fromHtml<HTMLImageElement>(attr);
              return Attribute.get(img, 'src');
            }),
            Assertions.cAssertEq('Search should show a dog', 'https://twemoji.maxcdn.com/v/13.0.1/72x72/1f436.png')
          ])
        ),
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sTryOnSelector('Focus should have moved to collection', doc, '.tox-collection__item'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        Waiter.sTryUntil(
          'Waiting for content update',
          tinyApis.sAssertContentPresence({
            'img[data-emoticon]': 1,
            'img[data-mce-resize="false"]': 1,
            'img[data-mce-placeholder="1"]': 1,
            'img[alt="\ud83d\udc36"]': 1,
            'img[src="https://twemoji.maxcdn.com/v/13.0.1/72x72/1f436.png"]': 1
          })
        )
      ])
      , onSuccess, onFailure);
  }, {
    plugins: 'emoticons',
    toolbar: 'emoticons',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    emoticons_database_url: '/project/tinymce/src/plugins/emoticons/main/js/emojiimages.js'
  }, success, failure);
});
