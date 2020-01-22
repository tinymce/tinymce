import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.DefaultLinkProtocolTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'link_default_protocol: "http"', [
        tinyApis.sSetSetting('link_default_protocol', 'http'),

        Log.stepsAsStep('TBA', 'www-urls are prompted to add http:// prefix, accept', [
          TestLinkUi.sInsertLink(tinyUi, 'www.google.com'),
          TestLinkUi.sWaitForUi(
            'wait for dialog',
            'p:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
          ),
          TestLinkUi.sClickConfirmYes,
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="http://www.google.com"]': 1 })
        ]),

        Log.stepsAsStep('TBA', 'www-urls are prompted to add http:// prefix, cancel', [
          TestLinkUi.sInsertLink(tinyUi, 'www.google.com'),
          TestLinkUi.sWaitForUi(
            'wait for dialog',
            'p:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
          ),
          TestLinkUi.sClickConfirmNo,
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="www.google.com"]': 1 })
        ]),

        Log.stepsAsStep('TBA', 'other urls are not prompted to add http:// prefix', [
          TestLinkUi.sInsertLink(tinyUi, 'google.com'),
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="google.com"]': 1 })
        ]),
      ]),

      Log.stepsAsStep('TBA', 'link_default_protocol: "https"', [
        tinyApis.sSetSetting('link_default_protocol', 'https'),

        Log.stepsAsStep('TBA', 'www-urls are prompted to add https:// prefix, accept', [
          TestLinkUi.sInsertLink(tinyUi, 'www.google.com'),
          TestLinkUi.sWaitForUi(
            'wait for dialog',
            'p:contains("The URL you entered seems to be an external link. Do you want to add the required https:// prefix?")'
          ),
          TestLinkUi.sClickConfirmYes,
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="https://www.google.com"]': 1 })
        ]),

        Log.stepsAsStep('TBA', 'www-urls are prompted to add https:// prefix, cancel', [
          TestLinkUi.sInsertLink(tinyUi, 'www.google.com'),
          TestLinkUi.sWaitForUi(
            'wait for dialog',
            'p:contains("The URL you entered seems to be an external link. Do you want to add the required https:// prefix?")'
          ),
          TestLinkUi.sClickConfirmNo,
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="www.google.com"]': 1 })
        ]),

        Log.stepsAsStep('TBA', 'other urls are not prompted to add https:// prefix', [
          TestLinkUi.sInsertLink(tinyUi, 'google.com'),
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="google.com"]': 1 })
        ]),
      ]),
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
