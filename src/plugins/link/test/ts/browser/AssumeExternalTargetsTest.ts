import '../../../../../themes/silver/main/ts/Theme';

import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.AssumeExternalTargetsTest', (success, failure) => {

  LinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Link: Test that with default setting, only www.-urls are prompted to add http:// prefix and with link_assume_external_targets: true, all urls are prompted', [
        TestLinkUi.sClearHistory,
        // with default setting, always prompts www.-urls, not other without protocol
        TestLinkUi.sInsertLink('www.google.com'),
        TestLinkUi.sWaitForUi(
          'wait for dialog',
          'p:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
        ),
        TestLinkUi.sClickConfirmYes,
        TestLinkUi.sAssertContentPresence(tinyApis, { a: 1 }),
        tinyApis.sSetContent(''),

        TestLinkUi.sInsertLink('google.com'),
        TestLinkUi.sAssertContentPresence(tinyApis, { a: 1 }),
        tinyApis.sSetContent(''),

        // with link_assume_external_targets: true, prompts on all, even without protocol
        tinyApis.sSetSetting('link_assume_external_targets', true),
        TestLinkUi.sInsertLink('www.google.com'),
        TestLinkUi.sWaitForUi(
          'wait for dialog',
          'p:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
        ),
        TestLinkUi.sClickConfirmYes,
        TestLinkUi.sAssertContentPresence(tinyApis, { a: 1 }),
        tinyApis.sSetContent(''),

        TestLinkUi.sInsertLink('google.com'),
        TestLinkUi.sWaitForUi(
          'wait for dialog',
          'p:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
        ),
        TestLinkUi.sClickConfirmYes,
        TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="http://google.com"]': 1 }),
        tinyApis.sSetContent(''),
        TestLinkUi.sClearHistory,
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
