import { Assertions, Chain, GeneralSteps, Logger, Mouse, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';
import { Html } from '@ephox/sugar';

import Plugin from 'tinymce/plugins/imagetools/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

import ImageUtils from '../module/test/ImageUtils';

UnitTest.asynctest('browser.tinymce.plugins.imagetools.ImageToolsErrorTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const uploadHandlerState = ImageUtils.createStateContainer();

  const corsUrl = 'http://moxiecode.cachefly.net/tinymce/v9/images/logo.png';

  Plugin();
  ModernTheme();

  const sAssertErrorMessage = function (html) {
    return Chain.asStep(TinyDom.fromDom(document.body), [
      UiFinder.cWaitFor('Could not find notification', '.mce-notification-inner'),
      Chain.mapper(Html.get),
      Assertions.cAssertHtml('Message html does not match', html)
    ]);
  };

  const sCloseErrorMessage = Chain.asStep(TinyDom.fromDom(document.body), [
    UiFinder.cWaitFor('Could not find notification', '.mce-notification > button'),
    Mouse.cClick
  ]);

  TinyLoader.setup(
    function (editor, onSuccess, onFailure) {
      const tinyApis = TinyApis(editor);
      const stepsWithTeardown = Arr.bind([
        Logger.t('incorrect service url no api key', GeneralSteps.sequence([
          uploadHandlerState.sResetState,
          tinyApis.sSetSetting('imagetools_proxy', 'http://0.0.0.0.0.0/'),
          tinyApis.sSetSetting('api_key', undefined),
          ImageUtils.sLoadImage(editor, corsUrl),
          tinyApis.sSelect('img', []),
          ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
          sAssertErrorMessage('ImageProxy HTTP error: Incorrect Image Proxy URL')
        ])),

        Logger.t('incorrect service url with api key', GeneralSteps.sequence([
          uploadHandlerState.sResetState,
          tinyApis.sSetSetting('imagetools_proxy', 'http://0.0.0.0.0.0/'),
          tinyApis.sSetSetting('api_key', 'fake_key'),
          ImageUtils.sLoadImage(editor, corsUrl),
          tinyApis.sSelect('img', []),
          ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
          sAssertErrorMessage('ImageProxy HTTP error: Incorrect Image Proxy URL')
        ])),

        Logger.t('403 no api key', GeneralSteps.sequence([
          uploadHandlerState.sResetState,
          tinyApis.sSetSetting('imagetools_proxy', '/custom/403'),
          tinyApis.sSetSetting('api_key', undefined),
          ImageUtils.sLoadImage(editor, corsUrl),
          tinyApis.sSelect('img', []),
          ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
          sAssertErrorMessage('ImageProxy HTTP error: Rejected request')
        ])),

        Logger.t('403 with api key', GeneralSteps.sequence([
          uploadHandlerState.sResetState,
          tinyApis.sSetSetting('imagetools_proxy', '/custom/403'),
          tinyApis.sSetSetting('api_key', 'fake_key'),
          ImageUtils.sLoadImage(editor, corsUrl),
          tinyApis.sSelect('img', []),
          ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
          sAssertErrorMessage('ImageProxy Service error: Invalid JSON in service error message')
        ])),

        Logger.t('403 with api key and return error data', GeneralSteps.sequence([
          uploadHandlerState.sResetState,
          tinyApis.sSetSetting('imagetools_proxy', '/custom/403data'),
          tinyApis.sSetSetting('api_key', 'fake_key'),
          ImageUtils.sLoadImage(editor, corsUrl),
          tinyApis.sSelect('img', []),
          ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
          sAssertErrorMessage('ImageProxy Service error: Unknown service error')
        ])),

        Logger.t('404 no api key', GeneralSteps.sequence([
          uploadHandlerState.sResetState,
          tinyApis.sSetSetting('imagetools_proxy', '/custom/404'),
          tinyApis.sSetSetting('api_key', undefined),
          ImageUtils.sLoadImage(editor, corsUrl),
          tinyApis.sSelect('img', []),
          ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
          sAssertErrorMessage('ImageProxy HTTP error: Could not find Image Proxy')
        ])),

        Logger.t('404 with api key', GeneralSteps.sequence([
          uploadHandlerState.sResetState,
          tinyApis.sSetSetting('imagetools_proxy', '/custom/404'),
          tinyApis.sSetSetting('api_key', 'fake_key'),
          ImageUtils.sLoadImage(editor, corsUrl),
          tinyApis.sSelect('img', []),
          ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
          sAssertErrorMessage('ImageProxy HTTP error: Could not find Image Proxy')
        ]))
      ], function (step) {
        return [
          step,
          GeneralSteps.sequence([
            sCloseErrorMessage,
            tinyApis.sSetContent('')
          ])
        ];
      });

      Pipeline.async({}, stepsWithTeardown, onSuccess, onFailure);
    },
    {
      plugins: 'imagetools',
      automatic_uploads: false,
      skin_url: '/project/js/tinymce/skins/lightgray'
    },
    success,
    failure
  );
});
