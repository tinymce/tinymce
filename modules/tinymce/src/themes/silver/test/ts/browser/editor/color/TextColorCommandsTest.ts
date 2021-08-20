import { afterEach, before, describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.color.TextColorCommandsTest', () => {
  before(function () {
    const browser = PlatformDetection.detect().browser;
    if (browser.isIE()) {
      this.skip();
    }
  });

  const state = Cell(null);
  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'forecolor backcolor',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ], true);

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
    TinyUiActions.clickOnToolbar(editor, '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#169179"]');
    assertState('mceApplyTextcolor');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 5);
    TinyUiActions.clickOnToolbar(editor, '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, '.tox-swatch--remove');
    assertState('mceRemoveTextcolor');
  });

  it('TBA: apply and remove backcolor and make sure of the right command has been executed', async () => {
    const editor = hook.editor();
    editor.setContent('hello test');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 5);
    TinyUiActions.clickOnToolbar(editor, '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#169179"]');
    assertState('mceApplyTextcolor');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 5);
    TinyUiActions.clickOnToolbar(editor, '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, '.tox-swatch--remove');
    assertState('mceRemoveTextcolor');
  });
});
