import { GeneralSteps } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { RawAssertions } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/imagetools/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import URI from 'tinymce/core/util/URI';
import ImageUtils from 'tinymce/plugins/imagetools/test/ImageUtils';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.plugins.imagetools.ImageToolsPluginTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];
  var uploadHandlerState = ImageUtils.createStateContainer();

  var srcUrl = '/project/src/plugins/imagetools/src/demo/img/dogleft.jpg';

  ModernTheme();
  Plugin();

  var sAssertUploadFilename = function (expected) {
    return Step.sync(function () {
      var blobInfo = uploadHandlerState.get().blobInfo;
      RawAssertions.assertEq('Should be expected file name', expected, blobInfo.filename());
    });
  };

  var sAssertUri = function (expected) {
    return Step.sync(function () {
      var blobInfo = uploadHandlerState.get().blobInfo;
      var uri = new URI(blobInfo.uri());
      RawAssertions.assertEq('Should be expected uri', expected, uri.relative);
    });
  };


  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyApis = TinyApis(editor);

    var sTestGenerateFileName = function () {
      return GeneralSteps.sequence([
        uploadHandlerState.sResetState,
        tinyApis.sSetSetting('images_reuse_filename', false),
        ImageUtils.sLoadImage(editor, srcUrl),
        tinyApis.sSelect('img', []),
        ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
        ImageUtils.sWaitForBlobImage(editor),
        ImageUtils.sUploadImages(editor),
        uploadHandlerState.sWaitForState,
        sAssertUploadFilename('imagetools0.jpg')
      ]);
    };

    var sTestReuseFilename = function () {
      return GeneralSteps.sequence([
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
      ]);
    };

    Pipeline.async({}, [
      sTestGenerateFileName(),
      sTestReuseFilename()
    ], onSuccess, onFailure);
  }, {
    plugins: 'imagetools',
    automatic_uploads: false,
    images_upload_handler: uploadHandlerState.handler(srcUrl),
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

