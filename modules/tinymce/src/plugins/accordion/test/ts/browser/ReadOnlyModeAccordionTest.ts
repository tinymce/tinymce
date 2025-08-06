import { Keys } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import AccordionPlugin from 'tinymce/plugins/accordion/Plugin';

describe('browser.tinymce.plugins.accordion.ReadOnlyModeAccordionTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold',
    plugins: 'accordion',
    indent: false,
    statusbar: false,
  }, [ AccordionPlugin ], true);

  const setMode = (editor: Editor, mode: string) => {
    editor.mode.set(mode);
  };

  beforeEach(() => setMode(hook.editor(), 'design'));

  it('TINY-10981: Toggling accordion should be permitted', () => {
    const editor = hook.editor();
    editor.setContent(`<details class="mce-accordion"><summary>Accordion summary…</summary><p>Accordion Body</p></details>`);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1 });

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 0 });
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1 });
  });

  it('TINY-10981: Toggling accordion should be permitted with execCommand', () => {
    const editor = hook.editor();
    editor.setContent(`<details class="mce-accordion"><summary>Accordion summary…</summary><p>Accordion Body</p></details>`);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
    editor.execCommand('ToggleAccordion', false, true);
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1 });

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
    editor.execCommand('ToggleAccordion', false, false);
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 0 });
    editor.execCommand('ToggleAccordion', false, true);
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1 });
  });

  it('TINY-10981: Executing RemoveAccordion should not permitted when in readonly mode', () => {
    const editor = hook.editor();
    editor.setContent(`<details class="mce-accordion"><summary>Accordion summary</summary><p>Accordion Body</p></details><details class="mce-accordion"><summary>Accordion summary</summary><p>Accordion Body</p></details>`);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
    editor.execCommand('RemoveAccordion');
    TinyAssertions.assertContent(editor, '<details class="mce-accordion"><summary>Accordion summary</summary><p>Accordion Body</p></details>');

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
    editor.execCommand('RemoveAccordion');
    TinyAssertions.assertContent(editor, '<details class="mce-accordion"><summary>Accordion summary</summary><p>Accordion Body</p></details>');
  });
});
