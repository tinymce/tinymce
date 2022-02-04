import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.fmt.FontsizeFormatTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'fontsize',
    font_size_formats: '1em',
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const assertMenuItemCount = (expected: number) => {
    const actual = document.querySelectorAll('.tox-collection__item').length;
    assert.equal(actual, expected, 'Should be correct count');
  };

  it('Check fontsize format toolbar button', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, 'button.tox-tbtn.tox-tbtn--select.tox-tbtn--bespoke');
    await TinyUiActions.pWaitForUi(editor, 'div.tox-menu.tox-collection.tox-collection--list.tox-selected-menu');
    assertMenuItemCount(1);
  });
});
