import { Pipeline, Log, FocusTools, Keyboard, Keys, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader, TinyDom } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.UpdateLinkTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const doc = TinyDom.fromDom(document);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Link: should not get anchor info if not selected node', [
        TestLinkUi.sClearHistory,
        tinyApis.sSetContent('<p><a href="http://tinymce.com" class="shouldbekept" title="shouldalsobekept">tiny</a></p>'),
        tinyApis.sSetSelection([0, 0, 0], 2, [0, 0, 0], 2),
        tinyApis.sExecCommand('mcelink'),
        TestLinkUi.sAssertDialogContents({
          href: 'http://tinymce.com',
          text: 'tiny',
          title: 'shouldalsobekept',
          target: ''
        }),
        FocusTools.sSetActiveValue(doc, 'http://something'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        Waiter.sTryUntil(
          'Wait until link is inserted',
          tinyApis.sAssertContentPresence({
            'a[href="http://something"]': 1,
            'a[class="shouldbekept"]': 1,
            'a[title="shouldalsobekept"]': 1
          })
        ),
        TestLinkUi.sClearHistory
      ]),
      Log.stepsAsStep('TBA', 'Link: should remove attributes if unset in the dialog', [
        TestLinkUi.sClearHistory,
        tinyApis.sSetContent('<p><a href="http://tinymce.com" class="shouldbekept" title="shouldnotbekept">tiny</a></p>'),
        tinyApis.sSetSelection([0, 0, 0], 2, [0, 0, 0], 2),
        tinyApis.sExecCommand('mcelink'),
        TestLinkUi.sAssertDialogContents({
          href: 'http://tinymce.com',
          text: 'tiny',
          title: 'shouldnotbekept',
          target: ''
        }),
        FocusTools.sSetActiveValue(doc, 'http://something'),
        TestLinkUi.sSetInputFieldValue('Title', ''),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        Waiter.sTryUntil(
          'Wait until link is inserted',
          tinyApis.sAssertContentPresence({
            'a[href="http://something"]': 1,
            'a[class="shouldbekept"]': 1,
            'a[title="shouldnotbekept"]': 0
          })
        ),
        TestLinkUi.sClearHistory
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: '',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
