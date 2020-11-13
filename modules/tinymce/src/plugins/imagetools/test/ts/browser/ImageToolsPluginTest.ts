import { Log, Logger, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';

import URI from 'tinymce/core/api/util/URI';
import ImagetoolsPlugin from 'tinymce/plugins/imagetools/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import * as ImageUtils from '../module/test/ImageUtils';

UnitTest.asynctest('browser.tinymce.plugins.imagetools.ImageToolsPluginTest', (success, failure) => {
  const browser = PlatformDetection.detect().browser;
  const uploadHandlerState = ImageUtils.createStateContainer();

  const srcUrl = '/project/tinymce/src/plugins/imagetools/demo/img/dogleft.jpg';
  const bmpSrcUrl = '/project/tinymce/src/plugins/imagetools/demo/img/dogleft.bmp';

  // Some browsers can transform BMP images on the canvas, others can't. When that happens the image is converted to a PNG.
  // See https://html.spec.whatwg.org/multipage/canvas.html#serialising-bitmaps-to-a-file
  const expectedBmpFilename = browser.isChrome() || browser.isIE() || browser.isEdge() ? 'dogleft.png' : 'dogleft.bmp';

  ImagetoolsPlugin();
  SilverTheme();

  const sAssertUploadFilename = (expected: string) => {
    return Logger.t('Assert uploaded filename', Step.sync(() => {
      const blobInfo = uploadHandlerState.get().blobInfo;
      Assert.eq('Should be expected file name', expected, blobInfo.filename());
    }));
  };

  const sAssertUploadFilenameMatches = (matchRegex: RegExp) => {
    return Logger.t('Assert uploaded filename', Step.sync(() => {
      const blobInfo = uploadHandlerState.get().blobInfo;
      Assert.eq(`File name ${blobInfo.filename()} should match ${matchRegex}`, true, matchRegex.test(blobInfo.filename()));
    }));
  };

  const sAssertUri = (expected: string) => {
    return Logger.t('ImageTools: Assert uri', Step.sync(() => {
      const blobInfo = uploadHandlerState.get().blobInfo;
      const uri = new URI(blobInfo.uri());
      Assert.eq('Should be expected uri', expected, uri.relative);
    }));
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
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
      Log.stepsAsStep('TINY-6642', 'ImageTools: test reuse filename with potentially converted format (bmp -> png)', [
        uploadHandlerState.sResetState,
        tinyApis.sSetSetting('images_reuse_filename', true),
        ImageUtils.sLoadImage(editor, bmpSrcUrl),
        tinyApis.sSelect('img', []),
        ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
        ImageUtils.sWaitForBlobImage(editor),
        ImageUtils.sUploadImages(editor),
        uploadHandlerState.sWaitForState,
        sAssertUploadFilename(expectedBmpFilename)
      ]),
      Log.stepsAsStep('TBA', 'ImageTools: test rotate image', [
        ImageUtils.sLoadImage(editor, srcUrl, { width: 200, height: 100 }),
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
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
