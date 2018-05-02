import { Pipeline, RawAssertions, Step } from '@ephox/agar';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.fmt.FontsizeFormatTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();

  const sAssertMenuItemCount = function (expected, editor) {
    return Step.sync(function () {
      const actual = document.querySelectorAll('.mce-menu-item').length;
      RawAssertions.assertEq('Should be correct count', expected, actual);
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      tinyUi.sClickOnToolbar('Could not find fontsize select', 'div[aria-label="Font Sizes"] button'),
      tinyUi.sWaitForUi('Menu did not appear', 'div.mce-floatpanel'),
      sAssertMenuItemCount(1, editor)
    ], onSuccess, onFailure);
  }, {
    toolbar: 'fontsizeselect',
    fontsize_formats: '1em',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
