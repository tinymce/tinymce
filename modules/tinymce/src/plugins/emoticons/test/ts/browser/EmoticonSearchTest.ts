import { Assertions, Chain, FocusTools, Keyboard, Keys, Log, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Attr, Body, Element } from '@ephox/sugar';

import EmoticonsPlugin from 'tinymce/plugins/emoticons/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { cFakeEvent } from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.emoticons.SearchTest', (success, failure) => {
  EmoticonsPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const doc = Element.fromDom(document);

    Pipeline.async({},
      Log.steps('TBA', 'Emoticons: Open dialog, Search for "rainbow", Rainbow should be first option', [
        tinyApis.sFocus(),
        tinyUi.sClickOnToolbar('click emoticons', 'button'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('wait for popup', 'div[role="dialog"]')
        ]),
        FocusTools.sTryOnSelector('Focus should start on input', doc, 'input'),
        FocusTools.sSetActiveValue(doc, 'rainbow'),
        Chain.asStep(doc, [
          FocusTools.cGetFocused,
          cFakeEvent('input')
        ]),
        Waiter.sTryUntil(
          'Wait until rainbow is the first choice (search should filter)',
          Chain.asStep(Body.body(), [
            UiFinder.cFindIn('.tox-collection__item:first'),
            Chain.mapper((item) => Attr.get(item, 'data-collection-item-value')),
            Assertions.cAssertEq('Search should show rainbow', '🌈')
          ])
        ),
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sTryOnSelector('Focus should have moved to collection', doc, '.tox-collection__item'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        Waiter.sTryUntil(
          'Waiting for content update',
          tinyApis.sAssertContent('<p>🌈</p>')
        )
      ])
      , onSuccess, onFailure);
  }, {
    plugins: 'emoticons',
    toolbar: 'emoticons',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    emoticons_database_url: '/project/tinymce/src/plugins/emoticons/main/js/emojis.js'
  }, success, failure);
});
