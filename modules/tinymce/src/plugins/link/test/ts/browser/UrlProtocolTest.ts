import {
  Pipeline,
  UiFinder,
  FocusTools,
  Log,
  GeneralSteps,
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.UrlProtocolTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const doc = TinyDom.fromDom(document);

    const testProtocolConfirm = (url, expectedProtocol) => {
      const presence = {};
      presence[`a[href="${expectedProtocol}${url}"]:contains("Something")`] = 1;

      return GeneralSteps.sequence([
        tinyApis.sSetContent('<p>Something</p>'),
        tinyApis.sSetSelection([ 0, 0 ], ''.length, [ 0, 0 ], 'Something'.length),
        TestLinkUi.sOpenLinkDialog(tinyUi),

        FocusTools.sSetActiveValue(doc, url),
        TestLinkUi.sAssertDialogContents({
          href: url,
          text: 'Something',
          title: '',
          target: ''
        }),
        TestLinkUi.sClickSave,
        TestLinkUi.sWaitForUi('Wait for confirm dialog to show', '[role="dialog"].tox-confirm-dialog'),
        TestLinkUi.sClickConfirmYes,
        TestLinkUi.sAssertContentPresence(tinyApis, presence)
      ]);
    };

    const testNoProtocolConfirm = (url) => {
      const presence = {};
      presence[`a[href="${url}"]:contains("Something")`] = 1;

      return GeneralSteps.sequence([
        tinyApis.sSetContent('<p>Something</p>'),
        tinyApis.sSetSelection([ 0, 0 ], ''.length, [ 0, 0 ], 'Something'.length),
        TestLinkUi.sOpenLinkDialog(tinyUi),

        FocusTools.sSetActiveValue(doc, url),
        TestLinkUi.sAssertDialogContents({
          href: url,
          text: 'Something',
          title: '',
          target: ''
        }),
        TestLinkUi.sClickSave,
        UiFinder.sNotExists(TinyDom.fromDom(document.body), '[role="dialog"]'),
        TestLinkUi.sAssertContentPresence(tinyApis, presence)
      ]);
    };

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Test regex for non relative ftp link', [
        testNoProtocolConfirm('ftp://testftp.com')
      ]),
      Log.stepsAsStep('TBA', 'Test new regex for non relative http link', [
        testNoProtocolConfirm('http://testhttp.com'),
        testNoProtocolConfirm('https://testhttp.com')
      ]),
      Log.stepsAsStep('TBA', 'Test regex for non relative link with no protocol', [
        testProtocolConfirm('www.http.com', 'http://')
      ]),
      Log.stepsAsStep('TBA', 'Test regex for relative link', [
        testNoProtocolConfirm('test.jpg')
      ]),
      Log.stepsAsStep('TBA', 'Test regex for anchor link', [
        testNoProtocolConfirm('#test')
      ]),
      Log.stepsAsStep('TBA', 'Test regex for email link with mailto:', [
        testNoProtocolConfirm('mailto:no-reply@example.com'),
      ]),
      Log.stepsAsStep('TBA', 'Test regex for email link', [
        testProtocolConfirm('no-reply@example.com', 'mailto:')
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
