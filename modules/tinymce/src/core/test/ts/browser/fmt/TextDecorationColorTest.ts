import { ApproxStructure } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

interface Selection {
  readonly startPath: number[];
  readonly sOffset: number;
  readonly finishPath: number[];
  readonly fOffset: number;
}
interface Text {
  readonly before: string;
  readonly selected: string;
  readonly after: string;
}

describe('browser.tinymce.core.fmt.TextDecorationColorTest', () => {
  const textColorHex = '#bfedd2';
  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'forecolor backcolor | bold italic underline strikethrough',
    formats: {
      custom_format: { inline: 'span', classes: 'abc', styles: { textDecoration: 'underline' }},
      // Overwrite the default strikethrough format from an "s" tag to the "span" variant to be able to test the merging logic in RemoveFormat.ts
      strikethrough: [
        { inline: 'span', styles: { textDecoration: 'line-through' }, exact: true }
      ],
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const pApplyForecolor = async (editor: Editor) => {
    TinyUiActions.clickOnToolbar(editor, '[aria-label^="Text color"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, `div[data-mce-color="${textColorHex.toUpperCase()}"]`);
  };

  const pRemoveForecolor = async (editor: Editor) => {
    TinyUiActions.clickOnToolbar(editor, '[aria-label^="Text color"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, '.tox-swatch--remove');
  };

  const applyCustomFormat = (editor: Editor, format: string) => editor.formatter.apply(format);
  const removeCustomFormat = (editor: Editor, format: string) => editor.formatter.remove(format);

  const toggleInlineStyle = (editor: Editor, style: string) => {
    TinyUiActions.clickOnToolbar(editor, `[aria-label="${style}"]`);
  };

  const assertEditorContent = (editor: Editor, content: string) => {
    const contentStructure = ApproxStructure.build((s) => s.element('body', {
      children: [
        ApproxStructure.fromHtml(content)
      ]
    }));
    TinyAssertions.assertContentStructure(editor, contentStructure);
  };

  const mergeForecolorAndTextDecoration = (toolbarLabel: string, textDecoration: string, text: Text, selection: Selection) => {
    const startText = `<p>${text.before + text.selected + text.after}</p>`;
    const selectText = (editor: Editor) =>
      TinySelections.setSelection(editor, selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset);

    return context(`TINY-4757: Merge forecolor and ${toolbarLabel} with text: ${text.before + text.selected + text.after}`, () => {
      it('TINY-4757: Apply forecolor then text-decoration then unapply them', async () => {
        const editor = hook.editor();
        editor.setContent(startText);
        selectText(editor);
        await pApplyForecolor(editor);
        assertEditorContent(editor, `<p>${text.before}<span style="color: ${textColorHex};">${text.selected}</span>${text.after}</p>`);
        toggleInlineStyle(editor, toolbarLabel);
        // TODO: This is different to test step below - need to investigate this in the future
        assertEditorContent(editor, `<p>${text.before}<span style="text-decoration: ${textDecoration};"><span style="color: ${textColorHex}; text-decoration: ${textDecoration};">${text.selected}</span></span>${text.after}</p>`);
        toggleInlineStyle(editor, toolbarLabel);
        assertEditorContent(editor, `<p>${text.before}<span style="color: ${textColorHex};">${text.selected}</span>${text.after}</p>`);
        await pRemoveForecolor(editor);
        assertEditorContent(editor, startText);
      });

      it('TINY-4757: Apply text-decoration then forecolor then unapply them', async () => {
        const editor = hook.editor();
        editor.setContent(startText);
        selectText(editor);
        toggleInlineStyle(editor, toolbarLabel);
        assertEditorContent(editor, `<p>${text.before}<span style="text-decoration: ${textDecoration};">${text.selected}</span>${text.after}</p>`);
        await pApplyForecolor(editor);
        assertEditorContent(editor, `<p>${text.before}<span style="color: ${textColorHex}; text-decoration: ${textDecoration};">${text.selected}</span>${text.after}</p>`);
        await pRemoveForecolor(editor);
        assertEditorContent(editor, `<p>${text.before}<span style="text-decoration: ${textDecoration};">${text.selected}</span>${text.after}</p>`);
        toggleInlineStyle(editor, toolbarLabel);
        assertEditorContent(editor, startText);
      });

      it('TINY-4757: Apply bold, forecolor then text-decoration then unapply them', async () => {
        const editor = hook.editor();
        editor.setContent(startText);
        selectText(editor);
        toggleInlineStyle(editor, 'Bold');
        assertEditorContent(editor, `<p>${text.before}<strong>${text.selected}</strong>${text.after}</p>`);
        await pApplyForecolor(editor);
        assertEditorContent(editor, `<p>${text.before}<span style="color: ${textColorHex};"><strong>${text.selected}</strong></span>${text.after}</p>`);
        toggleInlineStyle(editor, toolbarLabel);
        // TODO: This is different to test step below - need to investigate this in the future
        assertEditorContent(editor, `<p>${text.before}<span style="text-decoration: ${textDecoration};"><span style="color: ${textColorHex}; text-decoration: ${textDecoration};"><strong>${text.selected}</strong></span></span>${text.after}</p>`);
        toggleInlineStyle(editor, toolbarLabel);
        assertEditorContent(editor, `<p>${text.before}<span style="color: ${textColorHex};"><strong>${text.selected}</strong></span>${text.after}</p>`);
        await pRemoveForecolor(editor);
        assertEditorContent(editor, `<p>${text.before}<strong>${text.selected}</strong>${text.after}</p>`);
        toggleInlineStyle(editor, 'Bold');
        assertEditorContent(editor, startText);
      });

      it('TINY-4757: Apply bold, text-decoration then forecolor then unapply them', async () => {
        const editor = hook.editor();
        editor.setContent(startText);
        selectText(editor);
        toggleInlineStyle(editor, 'Bold');
        assertEditorContent(editor, `<p>${text.before}<strong>${text.selected}</strong>${text.after}</p>`);
        toggleInlineStyle(editor, toolbarLabel);
        assertEditorContent(editor, `<p>${text.before}<span style="text-decoration: ${textDecoration};"><strong>${text.selected}</strong></span>${text.after}</p>`);
        await pApplyForecolor(editor);
        assertEditorContent(editor, `<p>${text.before}<span style="color: ${textColorHex}; text-decoration: ${textDecoration};"><strong>${text.selected}</strong></span>${text.after}</p>`);
        await pRemoveForecolor(editor);
        assertEditorContent(editor, `<p>${text.before}<span style="text-decoration: ${textDecoration};"><strong>${text.selected}</strong></span>${text.after}</p>`);
        toggleInlineStyle(editor, toolbarLabel);
        assertEditorContent(editor, `<p>${text.before}<strong>${text.selected}</strong>${text.after}</p>`);
        toggleInlineStyle(editor, 'Bold');
        assertEditorContent(editor, startText);
      });
    });
  };

  const mergeForecolorAndTextDecorations = (text: Text, selection: Selection) => {
    const startText = `<p>${text.before + text.selected + text.after}</p>`;
    const selectText = (editor: Editor) =>
      TinySelections.setSelection(editor, selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset);

    return context(`TINY-4757: Merge forecolor and text decorations with text: ${text.before + text.selected + text.after}`, () => {
      it('TINY-4757: Apply forecolor and custom format then unapply them', async () => {
        const editor = hook.editor();
        editor.setContent(startText);
        selectText(editor);
        await pApplyForecolor(editor);
        assertEditorContent(editor, `<p>${text.before}<span style="color: ${textColorHex};">${text.selected}</span>${text.after}</p>`);
        applyCustomFormat(editor, 'custom_format');
        assertEditorContent(editor, `<p>${text.before}<span class="abc" style="color: ${textColorHex}; text-decoration: underline;">${text.selected}</span>${text.after}</p>`);
        removeCustomFormat(editor, 'custom_format');
        assertEditorContent(editor, `<p>${text.before}<span style="color: ${textColorHex};">${text.selected}</span>${text.after}</p>`);
        await pRemoveForecolor(editor);
        assertEditorContent(editor, startText);
      });

      it('TINY-4757: Apply custom format and forecolor then unapply them', async () => {
        const editor = hook.editor();
        editor.setContent(startText);
        selectText(editor);
        applyCustomFormat(editor, 'custom_format');
        assertEditorContent(editor, `<p>${text.before}<span class="abc" style="text-decoration: underline;">${text.selected}</span>${text.after}</p>`);
        await pApplyForecolor(editor);
        assertEditorContent(editor, `<p>${text.before}<span class="abc" style="color: ${textColorHex}; text-decoration: underline;">${text.selected}</span>${text.after}</p>`);
        await pRemoveForecolor(editor);
        assertEditorContent(editor, `<p>${text.before}<span class="abc" style="text-decoration: underline;">${text.selected}</span>${text.after}</p>`);
        removeCustomFormat(editor, 'custom_format');
        assertEditorContent(editor, startText);
      });
    });
  };

  Arr.each([
    {
      label: 'Collapsed selection',
      text: { before: '', selected: 'abc', after: '' },
      selection: { startPath: [ 0, 0 ], sOffset: 1, finishPath: [ 0, 0 ], fOffset: 1 }
    }, {
      label: 'Ranged selection: whole word',
      text: { before: '', selected: 'abc', after: ' def' },
      selection: { startPath: [ 0, 0 ], sOffset: 0, finishPath: [ 0, 0 ], fOffset: 'abc'.length }
    }, {
      label: 'Ranged selection: part of word',
      text: { before: 'a', selected: 'b', after: 'c def' },
      selection: { startPath: [ 0, 0 ], sOffset: 1, finishPath: [ 0, 0 ], fOffset: 2 }
    }, {
      label: 'Ranged selection: multiple words',
      text: { before: '', selected: 'abc def', after: '' },
      selection: { startPath: [ 0, 0 ], sOffset: 0, finishPath: [ 0, 0 ], fOffset: 'abc def'.length }
    }
  ], (test) => {
    context(test.label, () => {
      mergeForecolorAndTextDecoration('Underline', 'underline', test.text, test.selection);
      mergeForecolorAndTextDecoration('Strikethrough', 'line-through', test.text, test.selection);
      mergeForecolorAndTextDecorations(test.text, test.selection);
    });
  });
});
