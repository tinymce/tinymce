import { Assertions, Chain, GeneralSteps, Log, Mouse, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';
import { Html } from '@ephox/sugar';
import ImagetoolsPlugin from 'tinymce/plugins/imagetools/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as ImageUtils from '../module/test/ImageUtils';

// TODO: This needs to be looked at again once notifications come back

UnitTest.asynctest('browser.tinymce.plugins.imagetools.ImageToolsErrorTest', function (success, failure) {
  const uploadHandlerState = ImageUtils.createStateContainer();

  const corsUrl = 'http://moxiecode.cachefly.net/tinymce/v9/images/logo.png';

  ImagetoolsPlugin();
  SilverTheme();

  const sAssertErrorMessage = function (html) {
    return Step.label('Check notification message', Chain.asStep(TinyDom.fromDom(document.body), [
      UiFinder.cWaitFor('Find notification', '.tox-notification__body > p'),
      Chain.label('Get notification HTML', Chain.mapper(Html.get)),
      Chain.label('Assert HTML matches expected', Assertions.cAssertHtml('Message html does not match', html))
    ]));
  };

  const sCloseErrorMessage = Step.label('Close error message', Chain.asStep(TinyDom.fromDom(document.body), [
    UiFinder.cWaitFor('Could not find notification', '.tox-notification > button'),
    Mouse.cClick
  ]));

  TinyLoader.setupLight(
    function (editor, onSuccess, onFailure) {
      const tinyApis = TinyApis(editor);

      const sTestImageToolsError = (testId, description, proxyUrl, apiKey, errorMessage) => Log.step(
        testId, description, GeneralSteps.sequence([
          uploadHandlerState.sResetState,
          Step.label('Set image proxy URL', tinyApis.sSetSetting('imagetools_proxy', proxyUrl)),
          Step.label('Set API key', tinyApis.sSetSetting('api_key', apiKey)),
          ImageUtils.sLoadImage(editor, corsUrl),
          Step.label('Select image', tinyApis.sSelect('img', [])),
          ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
          sAssertErrorMessage(errorMessage),
          sCloseErrorMessage,
          Step.label('Clear editor content', tinyApis.sSetContent(''))
        ])
      );

      const tests = [

        sTestImageToolsError('TBA', 'Incorrect service url no api key',
          'http://0.0.0.0.0.0/', undefined, 'ImageProxy HTTP error: Incorrect Image Proxy URL'),

        sTestImageToolsError('TBA', 'Incorrect service url with api key',
          'http://0.0.0.0.0.0/', 'fake_key', 'ImageProxy HTTP error: Incorrect Image Proxy URL'),

        sTestImageToolsError('TBA', '403 no api key',
          '/custom/403', undefined, 'ImageProxy HTTP error: Rejected request'),

        sTestImageToolsError('TBA', '403 with api key',
          '/custom/403', 'fake_key', 'ImageProxy Service error: Invalid JSON in service error message'),

        sTestImageToolsError('TBA', '403 with api key and return error data',
          '/custom/403data', 'fake_key', 'ImageProxy Service error: Unknown service error'),

        sTestImageToolsError('TBA', '404 no api key',
          '/custom/404', undefined, 'ImageProxy HTTP error: Could not find Image Proxy'),

        sTestImageToolsError('TBA', '404 with api key',
          '/custom/404', 'fake_key', 'ImageProxy HTTP error: Could not find Image Proxy')

      ];

      Pipeline.async({}, tests, onSuccess, onFailure);
    },
    {
      theme: 'silver',
      plugins: 'imagetools',
      automatic_uploads: false,
      base_url: '/project/tinymce/js/tinymce'
    },
    success,
    failure
  );
});
