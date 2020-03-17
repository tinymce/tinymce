import { Assertions, Chain, Log, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Body, Element } from '@ephox/sugar';
import EmoticonsPlugin from 'tinymce/plugins/emoticons/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

const getFilename = (url: string) => {
  const m = /([^\/\\]+)$/.exec(url);
  if (m !== null) {
    return m[1];
  }
  return '';
};

UnitTest.asynctest('browser.tinymce.plugins.emoticons.DifferentEmojiDatabaseTest', (success, failure) => {
  EmoticonsPlugin();
  SilverTheme();

  const sTestEditorWithSettings = (categories, databaseUrl) => Step.async((onStepSuccess, onStepFailure) => {
    TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
      const tinyApis = TinyApis(editor);
      const tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        tinyApis.sFocus(),
        tinyUi.sClickOnToolbar('click emoticons', 'button'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('wait for popup', 'div[role="dialog"]'),
        ]),
        Waiter.sTryUntil(
          'Wait for emojis to load',
          UiFinder.sNotExists(Body.body(), '.tox-spinner')
        ),
        Chain.asStep(Body.body(), [
          UiFinder.cFindAllIn('[role="tab"]'),
          Chain.mapper((elements: Element[]) => Arr.map(elements, (elm: Element) => elm.dom().textContent)),
          Assertions.cAssertEq('Categories match', categories)
        ])
      ], onSuccess, onFailure);
    }, {
      plugins: 'emoticons',
      toolbar: 'emoticons',
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      emoticons_database_url: databaseUrl,
      emoticons_database_id: 'tinymce.plugins.emoticons.' + getFilename(databaseUrl)
    }, onStepSuccess, onStepFailure);
  });

  Pipeline.async({},
    Log.steps('TBA', 'Emoticon: Loading databases from different urls', [
      sTestEditorWithSettings([ 'All', 'People' ], '/project/tinymce/src/plugins/emoticons/test/js/test-emojis.js'),
      sTestEditorWithSettings([ 'All', 'Travel and Places' ], '/project/tinymce/src/plugins/emoticons/test/js/test-emojis-alt.js')
    ]), success, failure);
});
