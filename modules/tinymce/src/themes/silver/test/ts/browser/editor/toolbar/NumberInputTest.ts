import { UiControls } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

describe('browser.tinymce.themes.silver.throbber.ThrobberEditorTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: [ 'undo', 'fontsizeinput', 'redo' ]
  }, []);

  const pressEnter = (editor: Editor, target: HTMLElement, evt?: any) => {
    const dom = editor.dom;

    target.dispatchEvent(new KeyboardEvent('keydown', {
      code: 'Enter',
      key: 'Enter',
      charCode: 13,
      keyCode: 13,
      view: window,
      bubbles: true
    }));

    evt = Tools.extend({ keyCode: 13, shiftKey: false }, evt);
    dom.dispatch(target, 'keydown', evt);
    dom.dispatch(target, 'keypress', evt);
    dom.dispatch(target, 'keyup', evt);
  };

  it('TINY-9429: plus and minus should increase and decrease font size of the current selection', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    TinyUiActions.clickOnToolbar(editor, '.tox-number-input .plus');
    TinyAssertions.assertContent(editor, '<p>a<span style="font-size: 13pt;">b</span>c</p>');

    TinyUiActions.clickOnToolbar(editor, '.tox-number-input .minus');
    TinyAssertions.assertContent(editor, '<p>a<span style="font-size: 12pt;">b</span>c</p>');
  });

  it.skip('TINY-9429: should be possible to change the font size from the input', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    TinyUiActions.clickOnToolbar(editor, '.tox-number-input input');

    const input: SugarElement<HTMLInputElement> = TinyUiActions.clickOnToolbar(editor, '.tox-number-input input');
    UiControls.setValue(input, '15px');

    pressEnter(editor, input.dom); // TOFIX: this is not working

    TinyAssertions.assertContent(editor, '<p>a<span style="font-size: 15pt;">b</span>c</p>');
  });
});