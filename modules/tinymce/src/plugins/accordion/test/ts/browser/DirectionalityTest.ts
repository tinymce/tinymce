/* eslint-disable max-len */
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyAssertions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import AccordionPlugin from 'tinymce/plugins/accordion/Plugin';
import DirectionalityPlugin from 'tinymce/plugins/directionality/Plugin';

describe('browser.tinymce.plugins.accordion.DirectionalityTest', () => {
  const hook = TinyHooks.bddSetup<Editor>(
    {
      plugins: 'accordion directionality',
      base_url: '/project/tinymce/js/tinymce',
      indent: false,
    },
    [ AccordionPlugin, DirectionalityPlugin ]
  );

  beforeEach(() => {
    hook.editor().resetContent();
  });

  it('TINY-10291: should apply RTL on entire `details` and change children directionality', () => {
    const editor = hook.editor();
    editor.execCommand('InsertAccordion');
    // select entire accordion
    TinySelections.setSelection(editor, [], 0, [], 1);
    editor.execCommand('mceDirectionRTL');
    TinyAssertions.assertContent(editor, '<details class="mce-accordion" dir="rtl" open="open"><summary>Accordion summary...</summary><p>Accordion body...</p></details>');
    // select summary content
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    editor.execCommand('mceDirectionLTR');
    TinyAssertions.assertContent(editor, '<details class="mce-accordion" dir="rtl" open="open"><summary dir="ltr">Accordion summary...</summary><p>Accordion body...</p></details>');
    // select accordion body content
    TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 0);
    editor.execCommand('mceDirectionLTR');
    TinyAssertions.assertContent(editor, '<details class="mce-accordion" dir="rtl" open="open"><summary dir="ltr">Accordion summary...</summary><p dir="ltr">Accordion body...</p></details>');
  });

  it('TINY-10291: should apply RTL on nested `details` and change children directionality', () => {
    const editor = hook.editor();
    editor.execCommand('InsertAccordion');
    TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 0);
    editor.execCommand('InsertAccordion');
    // select entire nested accordion
    TinySelections.setSelection(editor, [ 0, 1 ], 0, [ 0, 1 ], 1);
    editor.execCommand('mceDirectionRTL');
    TinyAssertions.assertContent(editor, '<details class="mce-accordion" open="open"><summary>Accordion summary...</summary><details class="mce-accordion" dir="rtl" open="open"><summary>Accordion summary...</summary><p>Accordion body...</p></details><p>Accordion body...</p></details>');
    // select nested summary content
    TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 0);
    editor.execCommand('mceDirectionLTR');
    TinyAssertions.assertContent(editor, '<details class="mce-accordion" open="open"><summary>Accordion summary...</summary><details class="mce-accordion" dir="rtl" open="open"><summary dir="ltr">Accordion summary...</summary><p>Accordion body...</p></details><p>Accordion body...</p></details>');
    // select nested accordion body content
    TinySelections.setCursor(editor, [ 0, 1, 0, 1, 0 ], 0);
    editor.execCommand('mceDirectionLTR');
    TinyAssertions.assertContent(editor, '<details class="mce-accordion" open="open"><summary>Accordion summary...</summary><details class="mce-accordion" dir="rtl" open="open"><summary dir="ltr">Accordion summary...</summary><p dir="ltr">Accordion body...</p></details><p>Accordion body...</p></details>');
  });
});
