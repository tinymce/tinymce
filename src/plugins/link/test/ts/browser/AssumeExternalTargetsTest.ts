import '../../../../../themes/silver/main/ts/Theme';

import { GeneralSteps, Logger, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.AssumeExternalTargetsTest', (success, failure) => {

  LinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Default setting', [
        Logger.t('www-urls are prompted to add http:// prefix', GeneralSteps.sequence([
          TestLinkUi.sInsertLink('www.google.com'),
          TestLinkUi.sWaitForUi(
            'wait for dialog',
            'p:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
          ),
          TestLinkUi.sClickConfirmYes,
          TestLinkUi.sAssertContentPresence(tinyApis, { a: 1 }),
        ])),

        Logger.t('others urls are not prompted' , GeneralSteps.sequence([
          TestLinkUi.sInsertLink('google.com'),
          TestLinkUi.sAssertContentPresence(tinyApis, { a: 1 }),
        ])),
      ]),

      Log.stepsAsStep('TBA', 'link_assume_external_targets: true', [
        tinyApis.sSetSetting('link_assume_external_targets', true),

        Logger.t('www-urls are prompted to add http:// prefix', GeneralSteps.sequence([
          TestLinkUi.sInsertLink('www.google.com'),
          TestLinkUi.sWaitForUi(
            'wait for dialog',
            'p:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
          ),
          TestLinkUi.sClickConfirmYes,
          TestLinkUi.sAssertContentPresence(tinyApis, { a: 1 }),
        ])),

        Logger.t('other urls are prompted to add http:// prefix', GeneralSteps.sequence([
          TestLinkUi.sInsertLink('google.com'),
          TestLinkUi.sWaitForUi(
            'wait for dialog',
            'p:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
          ),
          TestLinkUi.sClickConfirmYes,
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="http://google.com"]': 1 }),
        ])),
      ]),
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
