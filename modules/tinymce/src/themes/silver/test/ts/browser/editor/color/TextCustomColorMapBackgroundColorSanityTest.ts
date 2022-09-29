import { UiFinder } from '@ephox/agar';
import { Assert, describe, it } from '@ephox/bedrock-client';
import { SugarShadowDom } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { getColorCols } from 'tinymce/themes/silver/ui/core/color/Options';

describe('browser.tinymce.themes.silver.editor.color.TextCustomColorMapBackgroundColorSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'forecolor backcolor fontsize',
    base_url: '/project/tinymce/js/tinymce',
    color_map_background: [
      '#0000FF', 'BLUE',
    ],
    color_cols_background: 3,
  }, [], true);

  const setupContent = (editor: Editor) => {
    editor.setContent('hello test');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 5);
  };

  const assertUiElementDoesNotExist = (editor: Editor, selector: string) =>
    UiFinder.notExists(SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(TinyDom.targetElement((editor)))), selector);

  it('TINY-9184: color_map_foreground works as expected', async () => {
    const editor = hook.editor();
    setupContent(editor);
    TinyUiActions.clickOnToolbar(editor, '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    assertUiElementDoesNotExist(editor, 'div[data-mce-color="#0000FF"]');
    assertUiElementDoesNotExist(editor, 'div[data-mce-color="#FF0000"]');
    Assert.eq('Cols is the expected value', getColorCols(editor, 'forecolor'), 5);
  });

  it('TINY-9184: color_map_background works as expected', async () => {
    const editor = hook.editor();
    setupContent(editor);
    TinyUiActions.clickOnToolbar(editor, '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    assertUiElementDoesNotExist(editor, 'div[data-mce-color="#FF0000"]');
    TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#0000FF"]');
    Assert.eq('Cols is the expected value', getColorCols(editor, 'hilitecolor'), 3);
  });
});
