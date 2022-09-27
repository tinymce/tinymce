import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarShadowDom } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.color.TextCustomColorSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'forecolor backcolor fontsize',
    base_url: '/project/tinymce/js/tinymce',
    color_map_foreground: [
      'red', 'RED',
    ],
    color_map_background: [
      'blue', 'BLUE',
    ],
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
    TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#FF0000"]');
  });

  it('TINY-9184: color_map_background works as expected', async () => {
    const editor = hook.editor();
    setupContent(editor);
    TinyUiActions.clickOnToolbar(editor, '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    assertUiElementDoesNotExist(editor, 'div[data-mce-color="#FF0000"]');
    TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#0000FF"]');
  });
});
