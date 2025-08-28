import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyAssertions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/accordion/Plugin';

import * as AccordionUtils from '../module/AccordionUtils';

describe('browser.tinymce.plugins.accordion.AccordionFormattingTest', () => {
  const hook = TinyHooks.bddSetup<Editor>(
    {
      plugins: 'accordion',
      base_url: '/project/tinymce/js/tinymce',
      indent: false
    },
    [ Plugin ]
  );

  it('TINY-10154: should apply heading to the summary', () => {
    const editor = hook.editor();
    editor.setContent(AccordionUtils.createAccordion({ summary: 'heading' }));
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
    editor.formatter.apply('h1');
    TinyAssertions.assertContent(editor, AccordionUtils.createAccordion({ summary: '<h1>heading</h1>' }));
  });

  it('TINY-10154: should apply heading to the nested summary', () => {
    const editor = hook.editor();
    editor.setContent(AccordionUtils.createAccordion({ body: AccordionUtils.createAccordion({ summary: 'heading' }) }));
    TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 2);
    editor.formatter.apply('h1');
    TinyAssertions.assertContent(editor, AccordionUtils.createAccordion({
      body: AccordionUtils.createAccordion({ summary: '<h1>heading</h1>' })
    }));
  });
});
