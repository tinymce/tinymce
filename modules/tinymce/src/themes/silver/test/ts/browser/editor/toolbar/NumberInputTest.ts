import { FocusTools, Keys, UiControls } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { SugarElement, SugarShadowDom } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.throbber.NumberInputTest', () => {
  const setInputSelection = (toolbarInput: Optional<HTMLInputElement>, index: number) => toolbarInput.each((input) => {
    input.selectionStart = index;
    input.selectionEnd = index;
  });

  const checkInputSelection = (toolbarInput: Optional<HTMLInputElement>, index: number, message?: string) => toolbarInput.fold(
    () => assert.fail('input should be found'),
    (input) => {
      assert.equal(input.selectionStart, index, `Start: ${message}`);
      assert.equal(input.selectionEnd, index, `End: ${message}`);
    }
  );

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: [ 'undo', 'fontsizeinput', 'redo' ]
  }, []);

  it('TINY-9429: plus and minus should increase and decrease font size of the current selection', () => {
    const editor = hook.editor();
    editor.setContent('<p style="font-size: 16px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    TinyUiActions.clickOnToolbar(editor, '.tox-number-input .plus');
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 17px;">b</span>c</p>');

    TinyUiActions.clickOnToolbar(editor, '.tox-number-input .minus');
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 16px;">b</span>c</p>');
  });

  it('TINY-9429: should be possible to change the font size from the input', async () => {
    const editor = hook.editor();
    editor.setContent('<p style="font-size: 16px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    TinyUiActions.clickOnToolbar(editor, '.tox-number-input input');

    const input: SugarElement<HTMLInputElement> = TinyUiActions.clickOnToolbar(editor, '.tox-number-input input');
    UiControls.setValue(input, '15px');
    const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.enter());

    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 15px;">b</span>c</p>');
  });

  it('TINY-9429: when input is selected arrow up should increase the size and arrow down decrease it', async () => {
    const editor = hook.editor();
    const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
    editor.setContent('<p style="font-size: 16px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.up());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 17px;">b</span>c</p>');

    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.down());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 16px;">b</span>c</p>');

    const input: SugarElement<HTMLInputElement> = TinyUiActions.clickOnToolbar(editor, '.tox-number-input input');
    UiControls.setValue(input, '2em');
    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 2em;">b</span>c</p>');

    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.up());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 2.1em;">b</span>c</p>');

    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should should be on input', root, '.tox-number-input input');
    TinyUiActions.keystroke(editor, Keys.down());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 2em;">b</span>c</p>');
  });

  it('TINY-9429: should navigate correctly via keyboard', async () => {
    const editor = hook.editor();
    const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));

    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should should be on input', root, '.tox-number-input input');

    TinyUiActions.keystroke(editor, Keys.escape());
    await FocusTools.pTryOnSelector('With escape it should pass from input to its wrapper', root, '.tox-number-input .tox-input-wrapper');

    TinyUiActions.keystroke(editor, Keys.left());
    await FocusTools.pTryOnSelector('With left it should pass from input-wrapper to minus button', root, '.tox-number-input .minus');

    TinyUiActions.keystroke(editor, Keys.right());
    await FocusTools.pTryOnSelector('With right it should pass from minut button to input-wrapper', root, '.tox-number-input .tox-input-wrapper');

    TinyUiActions.keystroke(editor, Keys.right());
    await FocusTools.pTryOnSelector('With right it should pass from input-wrapper to plus button', root, '.tox-number-input .plus');

    TinyUiActions.keystroke(editor, Keys.escape());
    await FocusTools.pTryOnSelector('With escape it should pass from plus button to number-input', root, '.tox-number-input');
  });

  it('TINY-9429: arrow up and arrow down should not change caret position in the input', async () => {
    const editor = hook.editor();
    const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
    const toolbarInput: Optional<HTMLInputElement> = Optional.from(root.dom.querySelector('.tox-input-wrapper input') as HTMLInputElement);
    editor.setContent('<p style="font-size: 10px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should should be on input', root, '.tox-number-input input');
    setInputSelection(toolbarInput, 2);

    TinyUiActions.keystroke(editor, Keys.up());

    checkInputSelection(toolbarInput, 2, 'selection should be preserved');
    TinyAssertions.assertContent(editor, '<p style="font-size: 10px;">a<span style="font-size: 11px;">b</span>c</p>');

    TinyUiActions.keystroke(editor, Keys.down());
    TinyUiActions.keystroke(editor, Keys.down());

    checkInputSelection(
      toolbarInput,
      1,
      'switching from 2 digit number to 1 digit number should mantain the selection beween the number and the unit'
    );
    TinyAssertions.assertContent(editor, '<p style="font-size: 10px;">a<span style="font-size: 9px;">b</span>c</p>');

    editor.setContent('<p style="font-size: 1px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    FocusTools.setFocus(root, '.tox-number-input input');
    await FocusTools.pTryOnSelector('Focus should should be on input', root, '.tox-number-input input');

    setInputSelection(toolbarInput, 1);

    TinyUiActions.keystroke(editor, Keys.down());

    TinyAssertions.assertContent(editor, '<p style="font-size: 1px;">a<span style="font-size: 0px;">b</span>c</p>');
    checkInputSelection(toolbarInput, 1, 'selection should be preserved');

    TinyUiActions.keystroke(editor, Keys.down());

    TinyAssertions.assertContent(editor, '<p style="font-size: 1px;">a<span style="font-size: 0px;">b</span>c</p>');

    checkInputSelection(toolbarInput, 1, 'selection should be preserved');
  });

  it('TINY-9429: plus and minus button should preserve focus after activation via `enter` and `space`', async () => {
    const editor = hook.editor();
    const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
    editor.setContent('<p style="font-size: 16px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    FocusTools.setFocus(root, '.tox-number-input .minus');
    await FocusTools.pTryOnSelector('Focus should should be on the minus button', root, '.tox-number-input .minus');

    TinyUiActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 15px;">b</span>c</p>');
    await FocusTools.pTryOnSelector('Focus should should be not change after enter is pressed', root, '.tox-number-input .minus');

    TinyUiActions.keystroke(editor, Keys.space());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 14px;">b</span>c</p>');
    await FocusTools.pTryOnSelector('Focus should should be not change after enter is pressed', root, '.tox-number-input .minus');

    editor.setContent('<p style="font-size: 16px;">abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    FocusTools.setFocus(root, '.tox-number-input .plus');
    await FocusTools.pTryOnSelector('Focus should should be on the plus button', root, '.tox-number-input .plus');

    TinyUiActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 17px;">b</span>c</p>');
    await FocusTools.pTryOnSelector('Focus should should be not change after enter is pressed', root, '.tox-number-input .plus');

    TinyUiActions.keystroke(editor, Keys.space());
    TinyAssertions.assertContent(editor, '<p style="font-size: 16px;">a<span style="font-size: 18px;">b</span>c</p>');
    await FocusTools.pTryOnSelector('Focus should should be not change after enter is pressed', root, '.tox-number-input .plus');
  });
});
