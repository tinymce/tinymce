import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { Waiter } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyDom } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { TinyUi } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/media/Plugin';
import Utils from '../module/test/Utils';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.plugins.media.DimensionsControlTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var ui = TinyUi(editor);

    Pipeline.async({}, [
      Utils.sOpenDialog(ui),
      ui.sClickOnUi('Click on close button', 'button:contains("Ok")'),
      Waiter.sTryUntil(
        'Wait for dialog to close',
        UiFinder.sNotExists(TinyDom.fromDom(document.body), 'div[aria-label="Insert/edit media"][role="dialog"]'),
        50, 5000
      )

    ], onSuccess, onFailure);
  }, {
    plugins: ["media"],
    toolbar: "media",
    media_dimensions: false,
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

