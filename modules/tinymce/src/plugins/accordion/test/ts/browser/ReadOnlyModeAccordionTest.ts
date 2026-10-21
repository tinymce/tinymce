import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
import AccordionPlugin from 'tinymce/plugins/accordion/Plugin';

import * as AccordionUtils from '../module/AccordionUtils';

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

  beforeEach(() => {
    setMode(hook.editor(), 'design');
    hook.editor().options.set('disabled', false);
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

  it('TINYMCE-14737: Opening an accordion in readonly mode keeps it closed in the content', async () => {
    const editor = hook.editor();
    editor.setContent(AccordionUtils.createAccordion({ open: false }));
    setMode(editor, 'readonly');
    await AccordionUtils.pOpenAccordionByAttribute(editor);
    TinyAssertions.assertContent(editor, AccordionUtils.createAccordion({ open: false }));
  });

  it('TINYMCE-14737: Opening an accordion in a disabled editor keeps it closed in the content', async () => {
    const editor = hook.editor();
    editor.setContent(AccordionUtils.createAccordion({ open: false }));
    editor.options.set('disabled', true);
    await AccordionUtils.pOpenAccordionByAttribute(editor);
    TinyAssertions.assertContent(editor, AccordionUtils.createAccordion({ open: false }));
  });
});
