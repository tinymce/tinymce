import { GeneralSteps, Logger, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.AssumeExternalTargetsTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Default setting', [
        Logger.t('www-urls are prompted to add http:// prefix, accept', GeneralSteps.sequence([
          TestLinkUi.sInsertLink(tinyUi, 'www.google.com'),
          TestLinkUi.sWaitForUi(
            'wait for dialog',
            'p:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
          ),
          TestLinkUi.sClickConfirmYes,
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="http://www.google.com"]': 1}),
        ])),

        Logger.t('www-urls are prompted to add http:// prefix, cancel', GeneralSteps.sequence([
          TestLinkUi.sInsertLink(tinyUi, 'www.google.com'),
          TestLinkUi.sWaitForUi(
            'wait for dialog',
            'p:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
          ),
          TestLinkUi.sClickConfirmNo,
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="www.google.com"]': 1}),
        ])),

        Logger.t('others urls are not prompted' , GeneralSteps.sequence([
          TestLinkUi.sInsertLink(tinyUi, 'google.com'),
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="google.com"]': 1 }),
        ])),
      ]),

      Log.stepsAsStep('TBA', 'link_assume_external_targets: true', [
        tinyApis.sSetSetting('link_assume_external_targets', true),

        Logger.t('www-urls are prompted to add http:// prefix', GeneralSteps.sequence([
          TestLinkUi.sInsertLink(tinyUi, 'www.google.com'),
          TestLinkUi.sWaitForUi(
            'wait for dialog',
            'p:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
          ),
          TestLinkUi.sClickConfirmYes,
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="http://www.google.com"]': 1 }),
        ])),

        Logger.t('other urls are prompted to add http:// prefix', GeneralSteps.sequence([
          TestLinkUi.sInsertLink(tinyUi, 'google.com'),
          TestLinkUi.sWaitForUi(
            'wait for dialog',
            'p:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
          ),
          TestLinkUi.sClickConfirmYes,
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="http://google.com"]': 1 }),
        ])),

        Logger.t('url not updated when prompt canceled', GeneralSteps.sequence([
          TestLinkUi.sInsertLink(tinyUi, 'google.com'),
          TestLinkUi.sWaitForUi(
            'wait for dialog',
            'p:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
          ),
          TestLinkUi.sClickConfirmNo,
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="google.com"]': 1 }),
        ])),
      ]),

      Log.stepsAsStep('TBA', 'link_assume_external_targets: http', [
        tinyApis.sSetSetting('link_assume_external_targets', 'http'),

        Logger.t('add http:// prefix to www-urls', GeneralSteps.sequence([
          TestLinkUi.sInsertLink(tinyUi, 'www.google.com'),
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="http://www.google.com"]': 1 }),
        ])),

        Logger.t('add http:// prefix to other urls', GeneralSteps.sequence([
          TestLinkUi.sInsertLink(tinyUi, 'google.com'),
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="http://google.com"]': 1 }),
        ])),
      ]),

      Log.stepsAsStep('TBA', 'link_assume_external_targets: https', [
        tinyApis.sSetSetting('link_assume_external_targets', 'https'),

        Logger.t('add https:// prefix to www-urls', GeneralSteps.sequence([
          TestLinkUi.sInsertLink(tinyUi, 'www.google.com'),
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="https://www.google.com"]': 1 }),
        ])),

        Logger.t('add https:// prefix to other urls', GeneralSteps.sequence([
          TestLinkUi.sInsertLink(tinyUi, 'google.com'),
          TestLinkUi.sAssertContentPresence(tinyApis, { 'a': 1, 'a[href="https://google.com"]': 1 }),
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
