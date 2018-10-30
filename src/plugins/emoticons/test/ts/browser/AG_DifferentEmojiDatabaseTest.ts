import 'tinymce/themes/silver/Theme';

import { Assertions, Chain, Log, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import * as UnitTest from '@ephox/bedrock/lib/api/UnitTest';
import TinyLoader from '@ephox/mcagar/lib/main/ts/ephox/mcagar/api/TinyLoader';
import EmoticonsPlugin from 'tinymce/plugins/emoticons/Plugin';
import TinyApis from '@ephox/mcagar/lib/main/ts/ephox/mcagar/api/TinyApis';
import TinyUi from '@ephox/mcagar/lib/main/ts/ephox/mcagar/api/TinyUi';
import * as Body from '@ephox/sugar/lib/main/ts/ephox/sugar/api/node/Body';
import { Element } from '@ephox/sugar';

UnitTest.asynctest('browser.tinymce.plugins.emoticons.DifferentEmojiDatabaseTest', (success, failure) => {
  EmoticonsPlugin();

  const sTestEditorWithSettings = (categories, databaseUrl) => Step.async((onStepSuccess, onStepFailure) => {
    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      const tinyApis = TinyApis(editor);
      const tinyUi = TinyUi(editor, {toolBarSelector: '.tox-toolbar'});

      Pipeline.async({}, [
          tinyApis.sFocus,
          tinyUi.sClickOnToolbar('click emoticons', 'button'),
          Chain.asStep({}, [
            tinyUi.cWaitForPopup('wait for popup', 'div[role="dialog"]'),
          ]),
          Waiter.sTryUntil(
            'Wait for emojis to load',
            UiFinder.sNotExists(Body.body(), '.tox-spinner'),
            100,
            1000
          ),
          Chain.asStep(Body.body(), [
            UiFinder.cFindAllIn('[role="tab"]'),
            Chain.mapper((elements: Element[]) => {
              return Arr.map(elements, (elm: Element) => {
                return elm.dom().textContent;
              });
            }),
            Assertions.cAssertEq('Categories match', categories)
          ])
        ], onSuccess, onFailure);
    }, {
      plugins: 'emoticons',
      toolbar: 'emoticons',
      theme: 'silver',
      skin_url: '/project/js/tinymce/skins/oxide',
      emoticons_database_url: databaseUrl
    }, onStepSuccess, onStepFailure);
  });

  Pipeline.async({},
    Log.steps('TBA', 'Emoticon: Loading databases from different urls', [
      sTestEditorWithSettings([ 'All', 'People' ], '/project/src/plugins/emoticons/test/json/test-emojis.js'),
      sTestEditorWithSettings([ 'All', 'Travel and Places' ], '/project/src/plugins/emoticons/test/json/test-emojis-alt.js')
    ]), success, failure);
});