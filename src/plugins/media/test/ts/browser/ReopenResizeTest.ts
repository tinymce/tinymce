import { Pipeline, RawAssertions, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.media.ReopenResizeTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  const sWaitForResizeHandles = function (editor) {
    return Waiter.sTryUntil('Wait for new width value', Step.sync(function () {
      RawAssertions.assertEq('Resize handle should exist', editor.dom.select('#mceResizeHandlenw').length, 1);
    }), 1, 3000);
  };

  const sRawAssertImagePresence = function (editor) {
    // Hacky way to assert that the placeholder image is in
    // the correct place that works cross browser
    // assertContentStructure did not work because some
    // browsers insert BRs and some do not
    return Step.sync(function () {
      const actualCount = editor.dom.select('img.mce-object').length;
      RawAssertions.assertEq('assert raw content', 1, actualCount);
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);

    Pipeline.async({}, [
      Utils.sOpenDialog(ui),
      Utils.sPasteSourceValue(ui, 'a'),
      Utils.sAssertWidthValue(ui, '300'),
      ui.sClickOnUi('Click on close button', 'button:contains("Ok")'),
      sWaitForResizeHandles(editor),
      Utils.sOpenDialog(ui),
      Utils.sChangeWidthValue(ui, '500'),
      ui.sClickOnUi('Click on close button', 'button:contains("Ok")'),
      sWaitForResizeHandles(editor),
      Waiter.sTryUntil(
        'Try assert content',
        sRawAssertImagePresence(editor),
        100, 3000
      )
    ], onSuccess, onFailure);
  }, {
    plugins: ['media'],
    toolbar: 'media',
    indent: false,
    forced_root_block: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
