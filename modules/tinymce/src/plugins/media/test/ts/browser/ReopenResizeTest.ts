import { Log, Logger, Pipeline, Step, Waiter } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.media.ReopenResizeTest', function (success, failure) {
  Plugin();
  Theme();

  const sWaitForResizeHandles = function (editor: Editor) {
    return Waiter.sTryUntil('Wait for new width value', Step.sync(function () {
      Assert.eq('Resize handle should exist', editor.dom.select('#mceResizeHandlenw').length, 1);
    }));
  };

  const sRawAssertImagePresence = function (editor: Editor) {
    // Hacky way to assert that the placeholder image is in
    // the correct place that works cross browser
    // assertContentStructure did not work because some
    // browsers insert BRs and some do not
    return Logger.t('Assert image is present', Step.sync(function () {
      const actualCount = editor.dom.select('img.mce-object').length;
      Assert.eq('assert raw content', 1, actualCount);
    }));
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Media: Open dialog, set source value, assert width, close dialog. Reopen dialog, change width, close dialog and assert resize handles are present', [
        Utils.sOpenDialog(ui),
        Utils.sPasteSourceValue(ui, 'a'),
        Utils.sAssertWidthValue(ui, '300'),
        ui.sClickOnUi('Click on close button', 'button:contains("Save")'),
        sWaitForResizeHandles(editor),
        Utils.sOpenDialog(ui),
        Utils.sChangeWidthValue(ui, '500'),
        ui.sClickOnUi('Click on close button', 'button:contains("Save")'),
        sWaitForResizeHandles(editor),
        Waiter.sTryUntil(
          'Try assert content',
          sRawAssertImagePresence(editor),
          10, 3000
        )
      ])
      , onSuccess, onFailure);
  }, {
    plugins: [ 'media' ],
    toolbar: 'media',
    theme: 'silver',
    indent: false,
    forced_root_block: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
