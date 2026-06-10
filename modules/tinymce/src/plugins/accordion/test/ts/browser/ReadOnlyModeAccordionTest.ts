import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
import AccordionPlugin from 'tinymce/plugins/accordion/Plugin';

describe('browser.tinymce.plugins.accordion.ReadOnlyModeAccordionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
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
