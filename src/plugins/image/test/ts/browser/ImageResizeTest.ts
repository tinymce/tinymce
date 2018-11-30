import { Assertions, Chain, Guard, Log, Mouse, Pipeline, UiControls, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import { Focus } from '@ephox/sugar';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { cFakeEvent, cSizeInput, dialogSelectors, cAssertCleanHtml } from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.image.ImageResizeTest', (success, failure) => {
  SilverTheme();
  ImagePlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Image: image proportion constrains should work directly', [
        tinyUi.sClickOnToolbar('click image button', 'button[aria-label="Insert/edit image"]'),
        Chain.asStep({}, [
          Chain.fromParent(tinyUi.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
            [
              Chain.fromChains([
                UiFinder.cFindIn('button.tox-browse-url'),
                Mouse.cClick
              ]),
              Chain.control(
                Chain.fromChains([
                  cSizeInput(dialogSelectors.widthInput),
                  UiControls.cGetValue,
                  Assertions.cAssertEq('width should be 1', '1')
                ]),
                Guard.tryUntil('did not find width input with value 1', 10, 1000)
              ),
              Chain.fromChains([
                cSizeInput(dialogSelectors.heightInput),
                Chain.op(Focus.focus),
                UiControls.cSetValue('5'),
                cFakeEvent('input')
              ]),
              Chain.control(
                Chain.fromChains([
                  cSizeInput(dialogSelectors.widthInput),
                  UiControls.cGetValue,
                  Assertions.cAssertEq('width should have changed to 5 after height change', '5')
                ]),
                Guard.tryUntil('did not find width input with value 5', 10, 1000)
              ),
            ]
          ),
          tinyUi.cSubmitDialog(),
          Chain.inject(editor),
          // TODO: When this fails it doesn't show the HTML error properly, this is because TinyLoader uses the "logs" parameter and bedrock doesn't understand that
          cAssertCleanHtml('Checking output', '<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" width="5" height="5" /></p>')
        ])
      ])

    ], onSuccess, onFailure);
  }, {
      theme: 'silver',
      plugins: 'image',
      toolbar: 'image',
      skin_url: '/project/js/tinymce/skins/oxide/',
      file_picker_callback(callback) {
        // tslint:disable-next-line:no-console
        console.log('file picker pressed');
        callback('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
      }
    }, success, failure);
});
