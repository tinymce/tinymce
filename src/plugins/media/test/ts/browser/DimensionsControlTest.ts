import { Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.media.DimensionsControlTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);

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
    plugins: ['media'],
    toolbar: 'media',
    media_dimensions: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
