import { ApproxStructure, Assertions, Chain, FocusTools, Keyboard, Keys, Log, Pipeline, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Attr, Body, Element } from '@ephox/sugar';

import EmoticonsPlugin from 'tinymce/plugins/emoticons/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { cFakeEvent } from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.emoticons.AppendTest', (success, failure) => {
  EmoticonsPlugin();
  SilverTheme();

  const tabElement = (s, str, arr) => (name): StructAssert => {
    return s.element('div', {
      attrs: {
        role: str.is('tab')
      },
      classes: [ arr.has('tox-tab'), arr.has('tox-dialog__body-nav-item') ],
      children: [
        s.text(str.is(name))
      ]
    });
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const doc = Element.fromDom(document);
    const body = Body.body();

    Pipeline.async({},
      Log.steps('TBA', 'Emoticons: Open dialog, verify custom categories listed and search for custom emoticon', [
        tinyApis.sFocus(),
        tinyUi.sClickOnToolbar('click emoticons', 'button'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('wait for popup', 'div[role="dialog"]'),
        ]),
        FocusTools.sTryOnSelector('Focus should start on input', doc, 'input'),
        Chain.asStep(body, [
          UiFinder.cFindIn('[role="tablist"]'),
          Assertions.cAssertStructure('check custom categories are shown', ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              children: [
                tabElement(s, str, arr)('All'),
                tabElement(s, str, arr)('People'),
                tabElement(s, str, arr)('User Defined')
              ]
            });
          })),
        ]),
        FocusTools.sSetActiveValue(doc, 'clock'),
        Chain.asStep(doc, [
          FocusTools.cGetFocused,
          cFakeEvent('input')
        ]),
        Waiter.sTryUntil(
          'Wait until clock is the first choice (search should filter)',
          Chain.asStep(body, [
            UiFinder.cFindIn('.tox-collection__item:first'),
            Chain.mapper((item) => {
              return Attr.get(item, 'data-collection-item-value');
            }),
            Assertions.cAssertEq('Search should show custom clock', '⏲')
          ])
        ),
        Keyboard.sKeydown(doc, Keys.tab(), {}),
        FocusTools.sTryOnSelector('Focus should have moved to collection', doc, '.tox-collection__item'),
        Keyboard.sKeydown(doc, Keys.enter(), {}),
        Waiter.sTryUntil(
          'Waiting for content update',
          tinyApis.sAssertContent('<p>⏲</p>')
        )
      ])
      , onSuccess, onFailure);
  }, {
    plugins: 'emoticons',
    toolbar: 'emoticons',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    emoticons_database_url: '/project/tinymce/src/plugins/emoticons/test/js/test-emojis.js',
    emoticons_database_id: 'tinymce.plugins.emoticons.test-emojis.js',
    emoticons_append: {
      clock: {
        keywords: [ 'clock', 'time' ],
        char: '⏲'
      },
      brain_explode: {
        keywords: [ 'brain', 'explode', 'blown' ],
        char: '🤯'
      }
    }
  }, success, failure);
});
