import { Assertions, Chain, Files, GeneralSteps, Log, Logger, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import Conversions from 'tinymce/core/file/Conversions';
import Plugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { sRunStepOnPatchedFileInput } from '../module/PatchInputFiles';

UnitTest.asynctest('browser.tinymce.plugins.image.ImagePluginTest', (success, failure) => {

  const src = 'http://moxiecode.cachefly.net/tinymce/v9/images/logo.png';
  const b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';

  SilverTheme();
  Plugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const api = TinyApis(editor);
    const ui = TinyUi(editor);

    const sAssertImageTab = function (title, isPresent) {
      return Logger.t('Assert image tab is present', GeneralSteps.sequence([
        ui.sClickOnToolbar('Trigger Image dialog', 'button[aria-label="Insert/edit image"]'),
        Chain.asStep({}, [
          ui.cWaitForPopup('Wait for Image dialog', 'div[role="dialog"]'),
          Chain.op(function (container) {
            const expected = {};
            expected['.tox-tab:contains("' + title + '")'] = isPresent ? 1 : 0;
            Assertions.assertPresence('Asserting presence', expected, container);
          })
        ]),
        ui.sClickOnUi('Close dialog', 'button:contains("Cancel")')
      ]));
    };

    const sTriggerUpload = Logger.t('Trigger upload', Step.async(function (next, die) {
      Conversions.uriToBlob(b64).then(function (blob) {
        Pipeline.async({}, [
          sRunStepOnPatchedFileInput([Files.createFile('logo.png', 0, blob)], Chain.asStep({}, [
            // cPopupToDialog('div[role="dialog"]'),
            ui.cWaitForPopup('Locate popup', 'div[role="dialog"]'),
            UiFinder.cFindIn('input[type="file"]'),
            Mouse.cClick
          ]))
        ], next, die);
      });
    }));

    const uploadTabNotPresent = Log.stepsAsStep('TBA', 'Image: Upload tab should not be present without images_upload_url or images_upload_handler', [
      api.sSetContent('<p><img src="' + src + '" /></p>'),
      api.sSelect('img', []),
      sAssertImageTab('Upload', false)
    ]);

    const uploadTabPresentOnUploadUrl = Log.stepsAsStep('TBA', 'Image: Upload tab should be present when images_upload_url is set to some truthy value', [
      api.sSetContent('<p><img src="' + src + '" /></p>'),
      api.sSelect('img', []),
      api.sSetSetting('image_advtab', false), // make sure that Advanced tab appears separately
      api.sSetSetting('images_upload_url', 'postAcceptor.php'),
      sAssertImageTab('Upload', true),
      sAssertImageTab('Advanced', false),
      api.sSetSetting('image_advtab', true),
      api.sDeleteSetting('images_upload_url'),
      sAssertImageTab('Upload', false),
      sAssertImageTab('Advanced', true)
    ]);

    const uploadTabPresentOnUploadHandler = Log.stepsAsStep('TBA', 'Image: Upload tab should be present when images_upload_handler is set to some truthy value', [
      api.sSetContent('<p><img src="' + src + '" /></p>'),
      api.sSelect('img', []),
      api.sSetSetting('image_advtab', false), // make sure that Advanced tab appears separately
      api.sSetSetting('images_upload_handler', function (blobInfo, success) {
        return success('file.jpg');
      }),
      sAssertImageTab('Upload', true),
      sAssertImageTab('Advanced', false),
      api.sSetSetting('image_advtab', true),
      api.sDeleteSetting('images_upload_handler'),
      sAssertImageTab('Upload', false),
      sAssertImageTab('Advanced', true)
    ]);

    const sAssertSrcTextValue = (expectedValue: string) => {
      return Waiter.sTryUntil('Waited for input to change to expected value', Chain.asStep(Body.body(), [
        UiFinder.cFindIn('label.tox-label:contains("Source") + div > div > input.tox-textfield'),
        Chain.op(function (input) {
          Assertions.assertEq('Assert field source value ', expectedValue, input.dom().value);
        })
      ]), 10, 10000);
    };

    // The following tests have been removed from the testing pipeline as they depend
    // on the triggerUpload functionality which is currently not feasible in the state of the code
    const uploadWithCustomRoute = Log.stepsAsStep('TBA', 'Image: Image uploader test with custom route', [
      api.sSetContent(''),
      api.sSetSetting('images_upload_url', '/custom/imageUpload'),
      ui.sClickOnToolbar('Trigger Image dialog', 'button[aria-label="Insert/edit image"]'),
      ui.sWaitForPopup('Wait for Image dialog', 'div[role="dialog"]'),
      ui.sClickOnUi('Switch to Upload tab', '.tox-tab:contains("Upload")'),
      sTriggerUpload,
      ui.sWaitForUi('Wait for General tab to activate', '.tox-tab:contains("General")'),
      sAssertSrcTextValue('uploaded_image.jpg'),
      api.sDeleteSetting('images_upload_url'),
      ui.sClickOnUi('Close dialog', 'button:contains("Cancel")')
    ]);

    const uploadWithCustomHandler = Log.stepsAsStep('TBA', 'Image: Image uploader test with images_upload_handler', [
      api.sSetContent(''),
      api.sSetSetting('images_upload_handler', (blobInfo, success) => {
        return success('file.jpg');
      }),
      ui.sClickOnToolbar('Trigger Image dialog', 'button[aria-label="Insert/edit image"]'),
      ui.sWaitForPopup('Wait for Image dialog', 'div[role="dialog"]'),
      ui.sClickOnUi('Switch to Upload tab', '.tox-tab:contains("Upload")'),
      sTriggerUpload,
      ui.sWaitForUi('Wait for General tab to activate', '.tox-tab:contains("General")'),
      sAssertSrcTextValue('file.jpg'),
      ui.sClickOnUi('Close dialog', 'button:contains("Cancel")')
    ]);

    const uploadCustomHandlerBase64String = Log.stepsAsStep('TBA', 'Image: Test that we get full base64 string in images_upload_handler', [
      api.sSetContent(''),
      api.sSetSetting('images_upload_handler', (blobInfo, success) => {
        return success(blobInfo.base64());
      }),
      ui.sClickOnToolbar('Trigger Image dialog', 'button[aria-label="Insert/edit image"]'),
      ui.sWaitForPopup('Wait for Image dialog', 'div[role="dialog"]'),
      ui.sClickOnUi('Switch to Upload tab', '.tox-tab:contains("Upload")'),
      sTriggerUpload,
      ui.sWaitForUi('Wait for General tab to activate', '.tox-tab:contains("General")'),
      sAssertSrcTextValue(b64.split(',')[1]),
      ui.sClickOnUi('Close dialog', 'button:contains("Cancel")')
    ]);

    Pipeline.async({}, [
      uploadTabNotPresent,
      uploadTabPresentOnUploadUrl,
      uploadTabPresentOnUploadHandler,
      uploadWithCustomRoute,
      uploadWithCustomHandler,
      uploadCustomHandlerBase64String
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'image',
    toolbar: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
