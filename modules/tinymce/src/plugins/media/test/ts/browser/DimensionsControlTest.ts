import { Pipeline, UiFinder, Waiter, Log, Chain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import Utils, { selectors } from '../module/test/Utils';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.plugins.media.DimensionsControlTest', function (success, failure) {
  Plugin();
  Theme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);

    Pipeline.async({}, Log.steps('TBA', 'Media: Open dialog, assert dimensions fields are not present while media_dimensions is false. Close dialog and assert dialog is not present', [
      Utils.sOpenDialog(ui),
      Chain.asStep({}, [
        Chain.fromParent(
          ui.cWaitForPopup('wait for popup', 'div.tox-dialog'),
          [
            Utils.cExists(selectors.source),
            Utils.cNotExists(selectors.width),
            Utils.cNotExists(selectors.height)
          ]
        )
      ]),
      ui.sClickOnUi('Click on close button', 'button:contains("Save")'),
      Waiter.sTryUntil(
        'Wait for dialog to close',
        UiFinder.sNotExists(TinyDom.fromDom(document.body), 'div[aria-label="Insert/edit media"][role="dialog"]'),
        50, 5000
      )
    ])
    , onSuccess, onFailure);
  }, {
    plugins: ['media'],
    toolbar: 'media',
    theme: 'silver',
    media_dimensions: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
