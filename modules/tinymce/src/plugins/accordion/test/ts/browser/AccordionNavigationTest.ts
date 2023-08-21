import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyAssertions, TinyContentActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/accordion/Plugin';

import * as AccordionUtils from '../module/AccordionUtils';

describe('browser.tinymce.plugins.accordion.AccordionNavigationTest', () => {
  const hook = TinyHooks.bddSetup<Editor>(
    {
      plugins: 'accordion',
      base_url: '/project/tinymce/js/tinymce',
    },
    [ Plugin ]
  );

  it('TINY-9827: should move cursor above the first child accordion on ArrowUp key pressing', () => {
    const editor = hook.editor();
    editor.resetContent();
    editor.execCommand('InsertAccordion');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.up());
    TinyAssertions.assertContent(editor, `<p>&nbsp;</p>\n` + AccordionUtils.createAccordion());
    TinyAssertions.assertCursor(editor, [ 0 ], 0);
  });

  it('TINY-9827: should move cursor below the last child accordion on ArrowDown key pressing', () => {
    const editor = hook.editor();
    editor.execCommand('InsertAccordion');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.down());
    TinyAssertions.assertContent(editor, AccordionUtils.createAccordion() + `\n<p>&nbsp;</p>`);
    TinyAssertions.assertCursor(editor, [ 1 ], 0);
  });
});
