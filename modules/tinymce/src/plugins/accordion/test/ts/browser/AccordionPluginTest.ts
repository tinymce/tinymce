import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyAssertions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import AccordionPlugin from '../../../main/ts/Plugin';

describe('browser.tinymce.plugins.accordion.AccordionPluginTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'accordion',
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    extended_valid_elements: 'details[class|open|data-mce-open],summary[class],div[class],p',
    base_url: '/project/tinymce/js/tinymce'
  }, [ AccordionPlugin ]);

  it('TINY-9730: Insert an accordion element into a single paragraph', () => {
    const editor = hook.editor();
    editor.setContent('<p>tiny</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 'tiny'.length);
    editor.execCommand('InsertAccordion');
    TinyAssertions.assertContent(
      editor,
      '<p>tiny</p><details class="mce-accordion"><summary class="mce-accordion-summary">Accordion summary...</summary>' +
      '<div class="mce-accordion-body"><p>Accordion body...</p></div></details>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'SUMMARY');
    TinyAssertions.assertCursor(editor, [ 1, 0 ], 1);
  });

  it('TINY-9730: Insert an accordion element into an empty paragraph', () => {
    const editor = hook.editor();
    editor.setContent('<p><br></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    editor.execCommand('InsertAccordion');
    TinyAssertions.assertContent(
      editor,
      '<details class="mce-accordion"><summary class="mce-accordion-summary">Accordion summary...</summary>' +
      '<div class="mce-accordion-body"><p>Accordion body...</p></div></details>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'SUMMARY');
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
  });

  it('TINY-9730: Insert an accordion element inheriting the selected text', () => {
    const editor = hook.editor();
    editor.setContent('<p>tiny</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'tiny'.length);
    editor.execCommand('InsertAccordion');
    TinyAssertions.assertContent(
      editor,
      '<p>tiny</p><details class="mce-accordion"><summary class="mce-accordion-summary">tiny</summary>' +
      '<div class="mce-accordion-body"><p>Accordion body...</p></div></details>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'SUMMARY');
    TinyAssertions.assertCursor(editor, [ 1, 0 ], 1);
  });
});
