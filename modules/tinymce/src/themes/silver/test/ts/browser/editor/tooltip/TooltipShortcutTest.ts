import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SavePlugin from 'tinymce/plugins/save/Plugin';
import SearchReplacePlugin from 'tinymce/plugins/searchreplace/Plugin';

import * as TooltipUtils from '../../../module/TooltipUtils';

describe('browser.tinymce.themes.silver.editor.TooltipShortcutTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    toolbar: 'bold italic underline selectall redo undo h1 h2 h3 h4 h5 h6 link save searchreplace fullscreen',
    toolbar_mode: 'wrap',
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'link save searchreplace fullscreen',
  }, [ LinkPlugin, SavePlugin, SearchReplacePlugin, FullscreenPlugin ]);
  const os = PlatformDetection.detect().os;

  const meta = os.isMacOS() || os.isiOS() ? '\u2318' : 'Ctrl+';
  const ctrl = os.isMacOS() || os.isiOS() ? '\u2303' : 'Ctrl+';
  const shift = os.isMacOS() || os.isiOS() ? '\u21E7' : 'Shift+';
  const alt = os.isMacOS() || os.isiOS() ? '\u2325' : 'Alt+';
  const headingShortcut = os.isMacOS() || os.isiOS() ? `${ctrl}${alt}` : `${shift}${alt}`;

  Arr.each([
    { button: 'bold', expectedTooltip: `Bold (${meta}B)` },
    { button: 'italic', expectedTooltip: `Italic (${meta}I)` },
    { button: 'underline', expectedTooltip: `Underline (${meta}U)` },
    { button: 'selectall', expectedTooltip: `Select all (${meta}A)` },
    { button: 'redo', expectedTooltip: `Redo (${meta}Y)` },
    { button: 'undo', expectedTooltip: `Undo (${meta}Z)` },
    { button: 'h1', expectedTooltip: `Heading 1 (${headingShortcut}1)` },
    { button: 'h2', expectedTooltip: `Heading 2 (${headingShortcut}2)` },
    { button: 'h3', expectedTooltip: `Heading 3 (${headingShortcut}3)` },
    { button: 'h4', expectedTooltip: `Heading 4 (${headingShortcut}4)` },
    { button: 'h5', expectedTooltip: `Heading 5 (${headingShortcut}5)` },
    { button: 'h6', expectedTooltip: `Heading 6 (${headingShortcut}6)` },
    { button: 'link', expectedTooltip: `Insert/edit link (${meta}K)` },
    { button: 'save', expectedTooltip: `Save (${meta}S)` },
    { button: 'searchreplace', expectedTooltip: `Find and replace (${meta}F)` },
    { button: 'fullscreen', expectedTooltip: `Fullscreen (${meta}${shift}F)` },
  ], (test) => {
    it(`TINY-10487: Assert keyboard shortcut present in tooltip for ${test.button}`, async () => {
      const editor = hook.editor();
      const buttonSelector = `button[data-mce-name="${test.button}"]`;
      await TooltipUtils.pAssertTooltip(editor, () => TooltipUtils.pTriggerTooltipWithMouse(editor, buttonSelector), test.expectedTooltip);
      await TooltipUtils.pCloseTooltip(editor, buttonSelector);
    });
  });
});
