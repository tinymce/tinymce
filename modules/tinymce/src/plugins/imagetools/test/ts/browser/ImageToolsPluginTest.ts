import { Pipeline, RawAssertions, Step, Logger, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import URI from 'tinymce/core/api/util/URI';
import ImagetoolsPlugin from 'tinymce/plugins/imagetools/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import ImageUtils from '../module/test/ImageUtils';

UnitTest.asynctest('browser.tinymce.plugins.imagetools.ImageToolsPluginTest', (success, failure) => {
  const uploadHandlerState = ImageUtils.createStateContainer();

  const srcUrl = '/project/tinymce/src/plugins/imagetools/demo/img/dogleft.jpg';

  ImagetoolsPlugin();
  SilverTheme();

  const sAssertUploadFilename = function (expected) {
    return Logger.t('Assert uploaded filename', Step.sync(function () {
      const blobInfo = uploadHandlerState.get().blobInfo;
      RawAssertions.assertEq('Should be expected file name', expected, blobInfo.filename());
    }));
  };

  const sAssertUploadFilenameMatches = function (matchRegex) {
    return Logger.t('Assert uploaded filename', Step.sync(function () {
      const blobInfo = uploadHandlerState.get().blobInfo;
      RawAssertions.assertEq(`File name ${blobInfo.filename()} should match ${matchRegex}`, true, matchRegex.test(blobInfo.filename()));
    }));
  };

  const sAssertUri = function (expected) {
    return Logger.t('ImageTools: Assert uri', Step.sync(function () {
      const blobInfo = uploadHandlerState.get().blobInfo;
      const uri = new URI(blobInfo.uri());
      RawAssertions.assertEq('Should be expected uri', expected, uri.relative);
    }));
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'ImageTools: test generate filename', [
        uploadHandlerState.sResetState,
        tinyApis.sSetSetting('images_reuse_filename', false),
        ImageUtils.sLoadImage(editor, srcUrl),
        tinyApis.sSelect('img', []),
        ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
        ImageUtils.sWaitForBlobImage(editor),
        ImageUtils.sUploadImages(editor),
        uploadHandlerState.sWaitForState,
        sAssertUploadFilenameMatches(/imagetools\d+\.jpg/)
      ]),
      Log.stepsAsStep('TBA', 'ImageTools: test reuse filename', [
        uploadHandlerState.sResetState,
        tinyApis.sSetSetting('images_reuse_filename', true),
        ImageUtils.sLoadImage(editor, srcUrl),
        tinyApis.sSelect('img', []),
        ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
        ImageUtils.sWaitForBlobImage(editor),
        ImageUtils.sUploadImages(editor),
        uploadHandlerState.sWaitForState,
        sAssertUploadFilename('dogleft.jpg'),
        sAssertUri(srcUrl)
      ]),
      Log.stepsAsStep('TBA', 'ImageTools: test rotate image', [
        ImageUtils.sLoadImage(editor, srcUrl, {width: 200, height: 100}),
        tinyApis.sSelect('img', []),
        ImageUtils.sExecCommand(editor, 'mceImageRotateRight'),
        ImageUtils.sWaitForBlobImage(editor),
        tinyApis.sAssertContentPresence({
          'img[width="100"][height="200"]': 1
        })
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'imagetools',
    automatic_uploads: false,
    images_upload_handler: uploadHandlerState.handler(srcUrl),
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
