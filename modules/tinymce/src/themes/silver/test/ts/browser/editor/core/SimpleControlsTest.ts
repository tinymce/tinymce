import { ApproxStructure, Keys, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections, TinyState, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.core.SimpleControlsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    menubar: 'edit insert format',
    toolbar: 'bold italic underline strikethrough superscript subscript h1 h2 h3 h4 h5 h6 cut paste removeformat remove print hr',
  }, []);

  const assertToolbarButtonPressed = (title: string) =>
    UiFinder.exists(SugarBody.body(), `button[title="${title}"][aria-pressed="true"]`);

  it('TBA: b tag is recognized as valid tag for bold', () => {
    const editor = hook.editor();
    editor.setContent('<p><b>bold text</b></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    assertToolbarButtonPressed('Bold');
  });

  it('TBA: strong tag is recognized as valid tag for bold', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>bold text</strong></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    assertToolbarButtonPressed('Bold');
  });

  it('TBA: Style "font-weight: bold" is recognized as valid style for bold', () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="font-weight: bold;">bold text</span></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    assertToolbarButtonPressed('Bold');
  });

  it('TBA: em tag is recognized as valid tag for italic', () => {
    const editor = hook.editor();
    editor.setContent('<p><em>italic text</em></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    assertToolbarButtonPressed('Italic');
  });

  it('TBA: i tag is recognized as valid tag for italic', () => {
    const editor = hook.editor();
    editor.setContent('<p><i>italic text</i></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    assertToolbarButtonPressed('Italic');
  });

  it('TBA: Style "font-style: italic" is recognized as valid style for italic', () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="font-style: italic;">italic text</span></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    assertToolbarButtonPressed('Italic');
  });

  it('TBA: Style "text-decoration: underline" is recognized as valid style for underline', () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="text-decoration: underline;">underlined text</span></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    assertToolbarButtonPressed('Underline');
  });

  it('TBA: u tag is recognized as valid tag for underline', () => {
    const editor = hook.editor();
    editor.setContent('<p><u>underlined text</u></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    assertToolbarButtonPressed('Underline');
  });

  it('TINY-6681: strike tag is recognized as valid tag for strikethrough', () => {
    const editor = hook.editor();
    editor.setContent('<p><strike>strikethrough text</strike></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    assertToolbarButtonPressed('Strikethrough');
  });

  it('TINY-6681: s tag is recognized as valid tag for strikethrough', () => {
    const editor = hook.editor();
    editor.setContent('<p><s>strikethrough text</s></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    assertToolbarButtonPressed('Strikethrough');
  });

  it('TINY-6681: Style "text-decoration: line-through" is recognized as valid style for strikethrough', () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="text-decoration: line-through;">strikethrough text</span></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    assertToolbarButtonPressed('Strikethrough');
  });

  it('TINY-8314: Assert print button exists', async () => {
    const editor = hook.editor();
    await TinyUiActions.pWaitForUi(editor, 'button[aria-label="Print"]');
  });

  it('TINY-8313: Click on the horizontal rule toolbar button and assert hr is added to the editor', () => {
    const editor = hook.editor();
    editor.setContent('');
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Horizontal line"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s) => {
      return s.element('body', {
        children: [
          s.element('hr', {}),
          s.anything()
        ]
      });
    }));
  });

  context('Noneditable root buttons', () => {
    const testDisableButtonOnNoneditable = (title: string) => () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label="${title}"][aria-disabled="true"]`);
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label="${title}"][aria-disabled="false"]`);
      });
    };

    it('TINY-9669: Disable bold on noneditable content', testDisableButtonOnNoneditable('Bold'));
    it('TINY-9669: Disable italic on noneditable content', testDisableButtonOnNoneditable('Italic'));
    it('TINY-9669: Disable underline on noneditable content', testDisableButtonOnNoneditable('Underline'));
    it('TINY-9669: Disable strikethrough on noneditable content', testDisableButtonOnNoneditable('Strikethrough'));
    it('TINY-9669: Disable superscript on noneditable content', testDisableButtonOnNoneditable('Superscript'));
    it('TINY-9669: Disable subscript on noneditable content', testDisableButtonOnNoneditable('Subscript'));
    it('TINY-9669: Disable h1 on noneditable content', testDisableButtonOnNoneditable('Heading 1'));
    it('TINY-9669: Disable h2 on noneditable content', testDisableButtonOnNoneditable('Heading 2'));
    it('TINY-9669: Disable h3 on noneditable content', testDisableButtonOnNoneditable('Heading 3'));
    it('TINY-9669: Disable h4 on noneditable content', testDisableButtonOnNoneditable('Heading 4'));
    it('TINY-9669: Disable h5 on noneditable content', testDisableButtonOnNoneditable('Heading 5'));
    it('TINY-9669: Disable h6 on noneditable content', testDisableButtonOnNoneditable('Heading 6'));
    it('TINY-9669: Disable cut on noneditable content', testDisableButtonOnNoneditable('Cut'));
    it('TINY-9669: Disable paste on noneditable content', testDisableButtonOnNoneditable('Paste'));
    it('TINY-9669: Disable removeformat on noneditable content', testDisableButtonOnNoneditable('Clear formatting'));
    it('TINY-9669: Disable remove on noneditable content', testDisableButtonOnNoneditable('Remove'));
    it('TINY-9669: Disable hr on noneditable content', testDisableButtonOnNoneditable('Horizontal line'));
  });

  context('Noneditable root menuitems', () => {
    const testDisableMenuitemOnNoneditable = (menu: string, menuitem: string) => async () => {
      await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        TinyUiActions.clickOnMenu(editor, `button:contains("${menu}")`);
        await TinyUiActions.pWaitForUi(editor, `[role="menu"] [title="${menuitem}"][aria-disabled="true"]`);
        TinyUiActions.keystroke(editor, Keys.escape());
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        TinyUiActions.clickOnMenu(editor, `button:contains("${menu}")`);
        await TinyUiActions.pWaitForUi(editor, `[role="menu"] [title="${menuitem}"][aria-disabled="false"]`);
        TinyUiActions.keystroke(editor, Keys.escape());
      });
    };

    it('TINY-9669: Disable bold on noneditable content', testDisableMenuitemOnNoneditable('Format', 'Bold'));
    it('TINY-9669: Disable italic on noneditable content', testDisableMenuitemOnNoneditable('Format', 'Italic'));
    it('TINY-9669: Disable underline on noneditable content', testDisableMenuitemOnNoneditable('Format', 'Underline'));
    it('TINY-9669: Disable strikethrough on noneditable content', testDisableMenuitemOnNoneditable('Format', 'Strikethrough'));
    it('TINY-9669: Disable superscript on noneditable content', testDisableMenuitemOnNoneditable('Format', 'Superscript'));
    it('TINY-9669: Disable subscript on noneditable content', testDisableMenuitemOnNoneditable('Format', 'Subscript'));
    it('TINY-9669: Disable code on noneditable content', testDisableMenuitemOnNoneditable('Format', 'Code'));
    it('TINY-9669: Disable removeformat on noneditable content', testDisableMenuitemOnNoneditable('Format', 'Clear formatting'));
    it('TINY-9669: Disable cut on noneditable content', testDisableMenuitemOnNoneditable('Edit', 'Cut'));
    it('TINY-9669: Disable paste on noneditable content', testDisableMenuitemOnNoneditable('Edit', 'Paste'));
    it('TINY-9669: Disable hr on noneditable content', testDisableMenuitemOnNoneditable('Insert', 'Horizontal line'));
  });
});
