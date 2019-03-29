import { Assertions, Chain, GeneralSteps, Logger, Pipeline, Step, UiFinder, Guard, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Conversions from 'tinymce/core/file/Conversions';
import Plugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.image.ImagePluginTest', (success, failure) => {

  const src = 'http://moxiecode.cachefly.net/tinymce/v9/images/logo.png';
  const b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';

  SilverTheme();
  Plugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const api = TinyApis(editor);
    const ui = TinyUi(editor);

    const cPopupToDialog = function (selector) {
      return Chain.control(
        Chain.fromChains([
          ui.cWaitForPopup('Locate popup', selector),
          Chain.async(function (container, next, die) {
            return Arr.find(editor.windowManager.getWindows(), function (win) {
              return container.dom().id === win._id;
            }).fold(() => die('Could not find popup window'), function (win) {
              next(win);
            });
          })
        ]),
        Guard.addLogging('Locate popup window')
      );
    };

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
          Chain.asStep({}, [
            // cPopupToDialog('div[role="dialog"]'),
            ui.cWaitForPopup('Locate popup', 'div[role="dialog"]'),
            UiFinder.cFindIn('input[type="file"]'),
            Chain.op(function (browse) {
              const browseBtn = browse.dom();
              // In order for this to work we need to find a way to set files in the input
              browseBtn.files = [];
            })
          ])
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

    const sAssertTextValue = function (fieldName, value) {
      return Chain.asStep({}, [
        cPopupToDialog('div[role="dialog"][aria-label="Insert/edit image"]'),
        Chain.op(function (win) {
          Assertions.assertEq('Assert field ' + src + ' value ', value, win.find('#' + fieldName).value());
        })
      ]);
    };

    // The following tests have been removed from the testing pipeline as they depend
    // on the triggerUpload functionality which is currently not feasible in the state of the code
    // @ts-ignore
    const uploadWithCustomRoute = Log.stepsAsStep('TBA', 'Image: Image uploader test with custom route', [
      api.sSetContent(''),
      api.sSetSetting('images_upload_url', '/custom/imageUpload'),
      ui.sClickOnToolbar('Trigger Image dialog', 'button[aria-label="Insert/edit image"]'),
      ui.sWaitForPopup('Wait for Image dialog', 'div[role="dialog"]'),
      ui.sClickOnUi('Switch to Upload tab', '.tox-tab:contains("Upload")'),
      sTriggerUpload,
      ui.sWaitForUi('Wait for General tab to activate', '.tox-tab.mce-active:contains("General")'),
      sAssertTextValue('src', 'uploaded_image.jpg'),
      api.sDeleteSetting('images_upload_url'),
      ui.sClickOnUi('Close dialog', 'button:contains("Cancel")')
    ]);

    // @ts-ignore
    const uploadWithCustomHandler = Log.stepsAsStep('TBA', 'Image: Image uploader test with images_upload_handler', [
      api.sSetContent(''),
      api.sSetSetting('images_upload_handler', function (blobInfo, success) {
        return success('file.jpg');
      }),
      ui.sClickOnToolbar('Trigger Image dialog', 'button[aria-label="Insert/edit image"]'),
      ui.sWaitForPopup('Wait for Image dialog', 'div[role="dialog"]'),
      ui.sClickOnUi('Switch to Upload tab', '.tox-tab:contains("Upload")'),
      sTriggerUpload,
      ui.sWaitForUi('Wait for General tab to activate', '.tox-tab.mce-active:contains("General")'),
      sAssertTextValue('src', 'file.jpg'),
      ui.sClickOnUi('Close dialog', 'button:contains("Cancel")')
    ]);

    // @ts-ignore
    const uploadCustomHandlerBase64String = Log.stepsAsStep('TBA', 'Image: Test that we get full base64 string in images_upload_handler', [
      api.sSetContent(''),
      api.sSetSetting('images_upload_handler', function (blobInfo, success) {
        return success(blobInfo.base64());
      }),
      ui.sClickOnToolbar('Trigger Image dialog', 'button[aria-label="Insert/edit image"]'),
      ui.sWaitForPopup('Wait for Image dialog', 'div[role="dialog"]'),
      ui.sClickOnUi('Switch to Upload tab', '.tox-tab:contains("Upload")'),
      sTriggerUpload,
      ui.sWaitForUi('Wait for General tab to activate', '.tox-tab.mce-active:contains("General")'),
      sAssertTextValue('src', b64.split(',')[1]),
      ui.sClickOnUi('Close dialog', 'button:contains("Cancel")')
    ]);

    Pipeline.async({}, [
      uploadTabNotPresent,
      uploadTabPresentOnUploadUrl,
      uploadTabPresentOnUploadHandler,
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'image',
    toolbar: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
