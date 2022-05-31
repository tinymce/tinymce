import { FocusTools, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

import { assertCleanHtml, assertInputCheckbox, assertInputValue, fillActiveDialog, generalTabSelectors } from '../module/Helpers';

describe('browser.tinymce.plugins.image.DecorativeImageDialogTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    toolbar: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    a11y_advanced_options: true
  }, [ Plugin ]);

  const pressTab = (editor: Editor) => TinyUiActions.keydown(editor, Keys.tab());
  const pressEsc = (editor: Editor) => TinyUiActions.keyup(editor, Keys.escape());

  const pAssertFocused = (name: string, selector: string) => FocusTools.pTryOnSelector(name, SugarDocument.getDocument(), selector);

  it('TBA: Insert Image Dialog basic keyboard navigation cycle', async () => {
    const editor = hook.editor();
    editor.execCommand('mceImage');
    await pAssertFocused('Source', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Descriptive', '.tox-checkbox__input');
    pressTab(editor);
    await pAssertFocused('Description', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Width', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Height', '.tox-textfield');
    pressTab(editor);
    await pAssertFocused('Constraint proportions', 'button.tox-lock');
    pressTab(editor);
    await pAssertFocused('Cancel', 'button.tox-button:contains("Cancel")');
    pressTab(editor);
    await pAssertFocused('Save', 'button.tox-button:contains("Save")');
    pressEsc(editor);
  });

  it('TBA: Image update with empty alt should remove the existing alt attribute', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1" alt="alt1" /></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);
    assertInputValue(generalTabSelectors.src, '#1');
    assertInputValue(generalTabSelectors.alt, 'alt1');
    fillActiveDialog({
      src: {
        value: 'src'
      },
      alt: ''
    });
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img src="src"></p>');
  });

  it('TBA: Image update with decorative toggled on should produce empty alt and role=presentation', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1" alt="alt1" /></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);
    assertInputValue(generalTabSelectors.src, '#1');
    assertInputValue(generalTabSelectors.alt, 'alt1');
    assertInputCheckbox(generalTabSelectors.decorative, false);
    fillActiveDialog({
      decorative: true
    });
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img role="presentation" src="#1" alt=""></p>');
  });

  it('TBA: Image update with decorative toggled off should produce empty alt and role=presentation', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img role="presentation" src="#1" alt="" /></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);
    assertInputValue(generalTabSelectors.src, '#1');
    assertInputValue(generalTabSelectors.alt, '');
    assertInputCheckbox(generalTabSelectors.decorative, true);
    fillActiveDialog({
      decorative: false
    });
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img src="#1"></p>');
  });
});
