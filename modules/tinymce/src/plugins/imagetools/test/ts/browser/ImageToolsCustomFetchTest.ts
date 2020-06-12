import { Log, Pipeline, Step, UiFinder } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { BlobConversions } from '@ephox/imagetools';
import { Cell, Option } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import Promise from 'tinymce/core/api/util/Promise';
import ImagetoolsPlugin from 'tinymce/plugins/imagetools/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as ImageUtils from '../module/test/ImageUtils';

UnitTest.asynctest('browser.tinymce.plugins.imagetools.ImageToolsCustomFetchTest', (success, failure) => {
  const uploadHandlerState = ImageUtils.createStateContainer();
  const srcUrl = '/project/tinymce/src/plugins/imagetools/demo/img/dogleft.jpg';
  const fetchState = Cell(Option.none());

  ImagetoolsPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'ImageTools: flip image with custom fetch image', [
        tinyApis.sSetSetting('imagetools_fetch_image', (img) => {
          fetchState.set(Option.some(img.src));
          return BlobConversions.imageToBlob(img);
        }),
        ImageUtils.sLoadImage(editor, srcUrl),
        tinyApis.sSelect('img', []),
        ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
        ImageUtils.sWaitForBlobImage(editor),
        Step.sync(() => {
          const actualSrc = fetchState.get().getOrDie('Could not get fetch state');
          const expectedSrc = document.location.protocol + '//' + document.location.host + '/project/tinymce/src/plugins/imagetools/demo/img/dogleft.jpg';

          Assert.eq('Should be the expected input image', expectedSrc, actualSrc);
        })
      ]),

      Log.stepsAsStep('TBA', 'ImageTools: flip image with custom fetch image that returns an error', [
        tinyApis.sSetSetting('imagetools_fetch_image', () => Promise.reject('Custom fail')),
        ImageUtils.sLoadImage(editor, srcUrl),
        tinyApis.sSelect('img', []),
        ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
        UiFinder.sWaitFor('Waited for notification', Body.body(), '.tox-notification__body:contains("Custom fail")')
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'imagetools',
    automatic_uploads: false,
    images_upload_handler: uploadHandlerState.handler(srcUrl),
    imagetools_cors_hosts: [ 'localhost' ],
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
