import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import * as TooltipUtils from '../../../module/TooltipUtils';

describe('browser.tinymce.themes.silver.editor.TooltipShortcutTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    toolbar: 'bold italic underline selectall redo undo h1 h2 h3 h4 h5 h6 link save searchreplace fullscreen',
    toolbar_mode: 'wrap',
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'link save searchreplace fullscreen',
  });

  Arr.each([
    { button: 'bold', expectedTooltip: 'Bold (⌘B)' },
    { button: 'italic', expectedTooltip: 'Italic (⌘I)' },
    { button: 'underline', expectedTooltip: 'Underline (⌘U)' },
    { button: 'selectall', expectedTooltip: 'Select all (⌘A)' },
    { button: 'redo', expectedTooltip: 'Redo (⌘Y)' },
    { button: 'undo', expectedTooltip: 'Undo (⌘Z)' },
    { button: 'h1', expectedTooltip: 'Heading 1 (⌥⇧1)' },
    { button: 'h2', expectedTooltip: 'Heading 2 (⌥⇧2)' },
    { button: 'h3', expectedTooltip: 'Heading 3 (⌥⇧3)' },
    { button: 'h4', expectedTooltip: 'Heading 4 (⌥⇧4)' },
    { button: 'h5', expectedTooltip: 'Heading 5 (⌥⇧5)' },
    { button: 'h6', expectedTooltip: 'Heading 6 (⌥⇧6)' },
    { button: 'link', expectedTooltip: 'Insert/edit link (⌘K)' },
    { button: 'save', expectedTooltip: 'Save (⌘S)' },
    { button: 'searchreplace', expectedTooltip: 'Find and replace (⌘F)' },
    { button: 'fullscreen', expectedTooltip: 'Fullscreen (⌘⇧F)' },
  ], (test) => {
    it(`TINY-10487: Assert keyboard shortcut present in tooltip for ${test.button}`, async () => {
      const editor = hook.editor();
      const buttonSelector = `button[data-mce-label="${test.button}"]`;
      await TooltipUtils.pAssertTooltip(editor, () => TooltipUtils.pTriggerTooltipWithMouse(editor, buttonSelector), test.expectedTooltip);
      await TooltipUtils.pCloseTooltip(editor, buttonSelector);
    });
  });
});
