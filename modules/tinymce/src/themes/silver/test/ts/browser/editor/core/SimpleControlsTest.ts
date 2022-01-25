import { ApproxStructure, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.core.SimpleControlsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold italic underline strikethrough print hr',
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
});
