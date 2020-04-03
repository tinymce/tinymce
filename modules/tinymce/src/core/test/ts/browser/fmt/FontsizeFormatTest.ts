import { Pipeline, Step } from '@ephox/agar';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.fmt.FontsizeFormatTest', function (success, failure) {

  Theme();

  const sAssertMenuItemCount = function (expected, _editor) {
    return Step.sync(function () {
      const actual = document.querySelectorAll('.tox-collection__item').length;
      Assert.eq('Should be correct count', expected, actual);
    });
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      tinyUi.sClickOnToolbar('Could not find fontsize select', 'button.tox-tbtn.tox-tbtn--select.tox-tbtn--bespoke'),
      tinyUi.sWaitForUi('Menu did not appear', 'div.tox-menu.tox-collection.tox-collection--list.tox-selected-menu'),
      sAssertMenuItemCount(1, editor)
    ], onSuccess, onFailure);
  }, {
    toolbar: 'fontsizeselect',
    fontsize_formats: '1em',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
