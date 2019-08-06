import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { console } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import ImagetoolsPlugin from 'tinymce/plugins/imagetools/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import ImageOps from '../module/test/ImageOps';
import ImageUtils from '../module/test/ImageUtils';

UnitTest.asynctest('browser.tinymce.plugins.imagetools.SequenceTest', (success, failure) => {

  // TODO TINY-3693 investigate why this test is so flaky. It's likely caused by race conditions.
  // tslint:disable-next-line:no-console
  console.log('Disabled due to being too flaky and causing fairly consistent failures');
  return success();

  const srcUrl = '/project/tinymce/src/plugins/imagetools/demo/img/dogleft.jpg';
  // var corsUrl = 'http://moxiecode.cachefly.net/tinymce/v9/images/logo.png';

  ImagetoolsPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const imgOps = ImageOps(editor);

    const sManipulateImage = function (message, url) {
      return Log.stepsAsStep('TBA', `ImageTools: ${message}`, [
        ImageUtils.sLoadImage(editor, url),
        tinyApis.sSelect('img', []),
        imgOps.sExecToolbar('Flip horizontally'),
        imgOps.sExecToolbar('Rotate clockwise'),
        imgOps.sExecDialog('Invert'),
        imgOps.sExecDialog('Crop'),
        imgOps.sExecDialog('Resize'),
        imgOps.sExecDialog('Flip vertically'),
        imgOps.sExecDialog('Rotate clockwise'),
        imgOps.sExecDialog('Brightness'),
        imgOps.sExecDialog('Sharpen'),
        imgOps.sExecDialog('Contrast'),
        imgOps.sExecDialog('Color levels'),
        imgOps.sExecDialog('Gamma')
      ]);
    };

    Pipeline.async({}, [
      // sManipulateImage('Test image operations on an image CORS domain', corsUrl),
      sManipulateImage('Test image operations on an image from the same domain', srcUrl)
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'imagetools',
    imagetools_cors_hosts: ['moxiecode.cachefly.net'],
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'editimage',
  }, success, failure);
});
