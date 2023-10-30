import { afterEach, before, describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.color.TextColorCommandsTest', () => {
  const selectors = {
    backcolorSplitButton: '[aria-label^="Background color"] > .tox-tbtn + .tox-split-button__chevron',
    forecolorSplitButton: '[aria-label^="Text color"] > .tox-tbtn + .tox-split-button__chevron'
  };

  const state = Cell<string | null>(null);
  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'forecolor backcolor',
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  before(() => {
    const editor = hook.editor();
    editor.on('ExecCommand', (e) => {
      state.set(e.command);
    });
  });

  const assertState = (expected: string) => {
    assert.equal(state.get(), expected, 'state should be the same');
  };

  afterEach(() => {
    state.set(null);
  });

  it('TBA: apply and remove forecolor and make sure of the right command has been executed', async () => {
    const editor = hook.editor();
    editor.setContent('hello test');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 5);
    TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#169179"]');
    assertState('mceApplyTextcolor');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 5);
    TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, '.tox-swatch--remove');
    assertState('mceRemoveTextcolor');
  });

  it('TBA: apply and remove backcolor and make sure of the right command has been executed', async () => {
    const editor = hook.editor();
    editor.setContent('hello test');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 5);
    TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#169179"]');
    assertState('mceApplyTextcolor');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 5);
    TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, '.tox-swatch--remove');
    assertState('mceRemoveTextcolor');
  });
});
