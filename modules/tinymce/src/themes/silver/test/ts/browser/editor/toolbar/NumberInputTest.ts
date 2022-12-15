import { FocusTools, Keys, UiControls } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarElement, SugarShadowDom } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.throbber.NumberInputTest', () => {
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
});
