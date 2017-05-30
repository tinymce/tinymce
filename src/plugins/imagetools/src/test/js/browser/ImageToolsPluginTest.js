asynctest(
  'browser.tinymce.plugins.imagetools.ImageToolsPluginTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.plugins.imagetools.Plugin',
    'tinymce.themes.modern.Theme',
    'tinymce.core.util.URI',
    'tinymce.plugins.imagetools.test.ImageOps',
    'tinymce.plugins.imagetools.test.ImageUtils'
  ],
  function (GeneralSteps, Logger, Pipeline, RawAssertions, Step, TinyApis, TinyLoader, Plugin, ModernTheme, URI, ImageOps, ImageUtils) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var uploadHandlerState = ImageUtils.createStateContainer();

    var srcUrl = '/project/src/plugins/imagetools/src/demo/img/dogleft.jpg';
    //var corsUrl = 'http://moxiecode.cachefly.net/tinymce/v9/images/logo.png';

    Plugin();
    ModernTheme();

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
      var imgOps = ImageOps(editor);

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

      var sManipulateImage = function (message, url) {
        return Logger.t(message, GeneralSteps.sequence([
          ImageUtils.sLoadImage(editor, url),
          tinyApis.sSelect('img', []),
          imgOps.sExec('Flip horizontally'),
          imgOps.sExec('Rotate clockwise')
        ]));
      };

      Pipeline.async({}, [
        sTestGenerateFileName(),
        sTestReuseFilename(),
        sManipulateImage('Test image operations on an image from the same domain', srcUrl)
        //sManipulateImage('Test image operations on an image CORS domain', corsUrl)
      ], onSuccess, onFailure);
    }, {
      plugins: 'imagetools',
      automatic_uploads: false,
      imagetools_cors_hosts: ['moxiecode.cachefly.net'],
      images_upload_handler: uploadHandlerState.handler(srcUrl),
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
