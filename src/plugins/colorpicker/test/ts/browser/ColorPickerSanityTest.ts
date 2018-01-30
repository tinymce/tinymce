import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import ColorPickerPlugin from 'tinymce/plugins/colorpicker/Plugin';
import TextColorPlugin from 'tinymce/plugins/textcolor/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.colorpicker.ColorPickerSanityTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  TextColorPlugin();
  ColorPickerPlugin();
  ModernTheme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      tinyUi.sClickOnToolbar('click forecolor arrow', 'div[aria-label="Text color"] button.mce-open'),
      tinyUi.sClickOnUi('click on custom btn', 'button:contains("Custom...")'),
      tinyUi.sWaitForPopup('wait for popup', 'div[role="dialog"][aria-label="Color"]'),
      tinyUi.sClickOnUi('could not find cancel button', 'button:contains("Cancel")'),
      tinyUi.sClickOnToolbar('click backcolor arrow', 'div[aria-label="Background color"] button.mce-open'),
      tinyUi.sClickOnUi('click on custom btn', 'button:contains("Custom...")'),
      tinyUi.sWaitForPopup('wait for popup', 'div[role="dialog"][aria-label="Color"]'),
      tinyUi.sClickOnUi('could not find cancel button', 'button:contains("Cancel")')
    ], onSuccess, onFailure);
  }, {
    plugins: 'colorpicker textcolor',
    toolbar: 'colorpicker forecolor backcolor',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
