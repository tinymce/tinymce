import { Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.fmt.FontsizeFormatTest', (success, failure) => {

  Theme();

  const sAssertMenuItemCount = (expected, _editor) => {
    return Step.sync(() => {
      const actual = document.querySelectorAll('.tox-collection__item').length;
      Assert.eq('Should be correct count', expected, actual);
    });
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
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
