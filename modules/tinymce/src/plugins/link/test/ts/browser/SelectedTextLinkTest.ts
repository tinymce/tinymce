import { FocusTools, Keyboard, Keys, Log, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.SelectedTextTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const doc = TinyDom.fromDom(document);

    Pipeline.async({},
      Log.steps('TBA', 'Link: complex selections should preserve the text', [
        TestLinkUi.sClearHistory,
        tinyApis.sSetContent('<p><strong>word</strong></p><p><strong>other</strong></p>'),
        tinyApis.sSetSelection([ 0 ], 0, [ 1 ], 1),
        tinyApis.sExecCommand('mcelink'),
        UiFinder.sWaitForVisible('wait for link dialog', TinyDom.fromDom(document.body), '[role="dialog"]'),
        FocusTools.sSetActiveValue(doc, 'http://something'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        Waiter.sTryUntil(
          'Wait until link is inserted',
          tinyApis.sAssertContentPresence({
            'a[href="http://something"]': 2,
            'p:contains(word)': 1,
            'p:contains(other)': 1,
            'p': 2
          })
        ),
        TestLinkUi.sClearHistory
      ])
      , onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: '',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
