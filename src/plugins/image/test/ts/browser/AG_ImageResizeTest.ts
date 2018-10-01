import { Assertions, Chain, Guard, Log, Mouse, Pipeline, UiControls, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import { Focus } from '@ephox/sugar';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { cFakeEvent, cSizeInputForLabel } from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.image.ImageResizeTest', (success, failure) => {
  SilverTheme();
  ImagePlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor, {
      toolBarSelector: '.tox-toolbar',
      dialogSubmitSelector: '.tox-button:contains("Ok")',
      dialogCloseSelector: '.tox-button:contains("Cancel")'
    });

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
              Chain.fromChains([
                Chain.control(
                  Chain.fromChains([
                    cSizeInputForLabel('Width'),
                    UiControls.cGetValue,
                    Assertions.cAssertEq('should be 1', '1')
                  ]),
                  Guard.tryUntil('did not find input with value 1', 10, 3000)
                )
              ]),
              Chain.fromChains([
                cSizeInputForLabel('Height'),
                Chain.op(Focus.focus),
                UiControls.cSetValue('5'),
                cFakeEvent('input')
              ]),
              Chain.fromChains([
                cSizeInputForLabel('Width'),
                UiControls.cGetValue,
                Assertions.cAssertEq('should have changed to 5', '5')
              ]),
              tinyUi.cSubmitDialog(),
            ]
          )
        ])
      ])

    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'image',
    toolbar: 'image',
    skin_url: '/project/js/tinymce/skins/oxide/',
    file_picker_callback (callback) {
      // tslint:disable-next-line:no-console
      console.log('file picker pressed');
      callback('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    }
  }, success, failure);
});
