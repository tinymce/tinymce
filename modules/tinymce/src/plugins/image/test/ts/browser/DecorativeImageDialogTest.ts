import { FocusTools, Keyboard, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/mcagar';
import { SugarDocument } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import {
  assertCleanHtml, assertInputCheckbox, assertInputValue, fillActiveDialog, generalTabSelectors, pWaitForDialog, submitDialog
} from '../module/Helpers';

describe('browser.tinymce.plugins.image.DescriptiveImageDialogTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    toolbar: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    a11y_advanced_options: true
  }, [ Plugin, Theme ]);

  const pressTab = () => Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.tab(), { });
  const pressEsc = () => Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.escape(), { });

  const pAssertFocused = (name: string, selector: string) => FocusTools.pTryOnSelector(name, SugarDocument.getDocument(), selector);

  it('TBA: Insert Image Dialog basic keyboard navigation cycle', async () => {
    const editor = hook.editor();
    editor.execCommand('mceImage');
    await pAssertFocused('Source', '.tox-textfield');
    pressTab();
    await pAssertFocused('Descriptive', '.tox-checkbox__input');
    pressTab();
    await pAssertFocused('Description', '.tox-textfield');
    pressTab();
    await pAssertFocused('Width', '.tox-textfield');
    pressTab();
    await pAssertFocused('Height', '.tox-textfield');
    pressTab();
    await pAssertFocused('Constraint proportions', 'button.tox-lock');
    pressTab();
    await pAssertFocused('Cancel', 'button.tox-button:contains("Cancel")');
    pressTab();
    await pAssertFocused('Save', 'button.tox-button:contains("Save")');
    pressEsc();
  });

  it('TBA: Image update with empty alt should remove the existing alt attribute', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1" alt="alt1" /></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    editor.execCommand('mceImage');
    await pWaitForDialog(editor);
    assertInputValue(generalTabSelectors.src, '#1');
    assertInputValue(generalTabSelectors.alt, 'alt1');
    fillActiveDialog({
      src: {
        value: 'src'
      },
      alt: ''
    });
    submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img src="src" /></p>');
  });

  it('TBA: Image update with decorative toggled on should produce empty alt and role=presentation', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1" alt="alt1" /></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    editor.execCommand('mceImage');
    await pWaitForDialog(editor);
    assertInputValue(generalTabSelectors.src, '#1');
    assertInputValue(generalTabSelectors.alt, 'alt1');
    assertInputCheckbox(generalTabSelectors.decorative, false);
    fillActiveDialog({
      decorative: true
    });
    submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img role="presentation" src="#1" alt="" /></p>');
  });

  it('TBA: Image update with decorative toggled off should produce empty alt and role=presentation', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img role="presentation" src="#1" alt="" /></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    editor.execCommand('mceImage');
    await pWaitForDialog(editor);
    assertInputValue(generalTabSelectors.src, '#1');
    assertInputValue(generalTabSelectors.alt, '');
    assertInputCheckbox(generalTabSelectors.decorative, true);
    fillActiveDialog({
      decorative: false
    });
    submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img src="#1" /></p>');
  });
});
