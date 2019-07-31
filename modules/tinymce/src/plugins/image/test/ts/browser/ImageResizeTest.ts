import { Chain, Guard, Log, Mouse, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { console } from '@ephox/dom-globals';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { cAssertCleanHtml, cAssertInputValue, cSetInputValue, generalTabSelectors } from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.image.ImageResizeTest', (success, failure) => {
  SilverTheme();
  ImagePlugin();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
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
                cAssertInputValue(generalTabSelectors.width, '1'),
                Guard.tryUntil('did not find width input with value 1', 10, 1000)
              ),
              cSetInputValue(generalTabSelectors.height, '5'),
              Chain.control(
                cAssertInputValue(generalTabSelectors.width, '5'),
                Guard.tryUntil('did not find width input with value 5', 10, 1000)
              ),
            ]
          ),
          tinyUi.cSubmitDialog(),
          Chain.inject(editor),
          cAssertCleanHtml('Checking output', '<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" width="5" height="5" /></p>')
        ])
      ])

    ], onSuccess, onFailure);
  }, {
      theme: 'silver',
      plugins: 'image',
      toolbar: 'image',
      base_url: '/project/tinymce/js/tinymce',
      file_picker_callback(callback) {
        // tslint:disable-next-line:no-console
        console.log('file picker pressed');
        callback('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
      }
    }, success, failure);
});
