asynctest(
  'browser.tinymce.plugins.imagetools.ImageToolsErrorTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.katamari.api.Arr',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyDom',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.util.URI',
    'tinymce.plugins.imagetools.Plugin',
    'tinymce.plugins.imagetools.test.ImageOps',
    'tinymce.plugins.imagetools.test.ImageUtils',
    'tinymce.themes.modern.Theme'
  ],
  function (
    Assertions, Chain, GeneralSteps, Logger, Mouse, Pipeline, RawAssertions, Step, UiFinder, Arr, TinyApis, TinyDom, TinyLoader, URI, Plugin, ImageOps, ImageUtils,
    ModernTheme
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var uploadHandlerState = ImageUtils.createStateContainer();

    var srcUrl = '/project/src/plugins/imagetools/src/demo/img/dogleft.jpg';
    var corsUrl = 'http://moxiecode.cachefly.net/tinymce/v9/images/logo.png';

    Plugin();
    ModernTheme();

    var sAssertErrorMessage = function (html) {
      return Chain.asStep(TinyDom.fromDom(document.body), [
        UiFinder.cWaitFor('Could not find notification', '.mce-notification-inner'),
        Chain.mapper(function (node) {
          return node.dom().innerHTML;
        }),
        Assertions.cAssertHtml('Message html does not match', html)
      ]);
    };

    var sCloseErrorMessage = Chain.asStep(TinyDom.fromDom(document.body), [
      UiFinder.cWaitFor('Could not find notification', '.mce-notification > button'),
      Mouse.cClick
    ]);


    TinyLoader.setup(
      function (editor, onSuccess, onFailure) {
        var tinyApis = TinyApis(editor);
        var stepsWithTeardown = Arr.bind([
          // Logger.t('incorrect service url no api key', GeneralSteps.sequence([
          //   uploadHandlerState.sResetState,
          //   tinyApis.sSetSetting('imagetools_proxy', 'http://noserver/'),
          //   tinyApis.sSetSetting('api_key', undefined),
          //   ImageUtils.sLoadImage(editor, corsUrl),
          //   tinyApis.sSelect('img', []),
          //   ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
          //   sAssertErrorMessage('ImageProxy HTTP error: 0')
          // ])),

          // Logger.t('incorrect service url with api key', GeneralSteps.sequence([
          //   uploadHandlerState.sResetState,
          //   tinyApis.sSetSetting('imagetools_proxy', 'http://noserver/'),
          //   tinyApis.sSetSetting('api_key', 'fake_key'),
          //   ImageUtils.sLoadImage(editor, corsUrl),
          //   tinyApis.sSelect('img', []),
          //   ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
          //   sAssertErrorMessage('ImageProxy HTTP error: 0')
          // ])),

          // Logger.t('403 no api key', GeneralSteps.sequence([
          //   uploadHandlerState.sResetState,
          //   tinyApis.sSetSetting('imagetools_proxy', '/custom/403'),
          //   tinyApis.sSetSetting('api_key', undefined),
          //   ImageUtils.sLoadImage(editor, corsUrl),
          //   tinyApis.sSelect('img', []),
          //   ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
          //   sAssertErrorMessage('ImageProxy HTTP error: 403')
          // ])),

          Logger.t('403 with api key', GeneralSteps.sequence([
            uploadHandlerState.sResetState,
            tinyApis.sSetSetting('imagetools_proxy', '/custom/403'),
            tinyApis.sSetSetting('api_key', 'fake_key'),
            ImageUtils.sLoadImage(editor, corsUrl),
            tinyApis.sSelect('img', []),
            ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
            sAssertErrorMessage('ImageProxy Service error: Invalid JSON')
          ])),

          Logger.t('403 with api key and return error data', GeneralSteps.sequence([
            uploadHandlerState.sResetState,
            tinyApis.sSetSetting('imagetools_proxy', '/custom/403data'),
            tinyApis.sSetSetting('api_key', 'fake_key'),
            ImageUtils.sLoadImage(editor, corsUrl),
            tinyApis.sSelect('img', []),
            ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
            sAssertErrorMessage('ImageProxy Service error: Error from server')
          ])),

          Logger.t('404 no api key', GeneralSteps.sequence([
            uploadHandlerState.sResetState,
            tinyApis.sSetSetting('imagetools_proxy', '/custom/404'),
            tinyApis.sSetSetting('api_key', undefined),
            ImageUtils.sLoadImage(editor, corsUrl),
            tinyApis.sSelect('img', []),
            ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
            sAssertErrorMessage('ImageProxy HTTP error: 404')
          ])),

          Logger.t('404 with api key', GeneralSteps.sequence([
            uploadHandlerState.sResetState,
            tinyApis.sSetSetting('imagetools_proxy', '/custom/404'),
            tinyApis.sSetSetting('api_key', 'fake_key'),
            ImageUtils.sLoadImage(editor, corsUrl),
            tinyApis.sSelect('img', []),
            ImageUtils.sExecCommand(editor, 'mceImageFlipHorizontal'),
            sAssertErrorMessage('ImageProxy HTTP error: 404')
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
        // imagetools_cors_hosts: ['moxiecode.cachefly.net'],
        skin_url: '/project/src/skins/lightgray/dist/lightgray'
      },
      success,
      failure
    );
  }
);
