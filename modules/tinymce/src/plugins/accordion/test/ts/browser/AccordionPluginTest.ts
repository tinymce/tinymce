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

  interface InsertAccordionTest {
    initialContent: string;
    initialCursor: [ number[], number ];
    assertContent: string;
    assertCursor: [ number[], number ];
  };
  const testInsertingAccordion = (editor: Editor, test: InsertAccordionTest): void => {
    editor.setContent(test.initialContent);
    TinySelections.setCursor(editor, ...test.initialCursor);
    editor.execCommand('InsertAccordion');
    TinyAssertions.assertContent(editor, test.assertContent);
    assert.equal(editor.selection.getNode().nodeName, 'SUMMARY');
    TinyAssertions.assertCursor(editor, ...test.assertCursor);
  };

  it('TINY-9730: Insert an accordion into a single paragraph', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<p>tiny</p>',
      initialCursor: [ [ 0, 0 ], 'tiny'.length ],
      assertContent: '<p>tiny</p><details class="mce-accordion"><summary class="mce-accordion-summary">Accordion summary...</summary>' +
        '<div class="mce-accordion-body"><p>Accordion body...</p></div></details>',
      assertCursor: [ [ 1, 0 ], 1 ],
    });
  });

  it('TINY-9730: Insert an accordion into an empty paragraph', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<p><br></p>',
      initialCursor: [ [ 0, 0 ], 0 ],
      assertContent: '<details class="mce-accordion"><summary class="mce-accordion-summary">Accordion summary...</summary>' +
        '<div class="mce-accordion-body"><p>Accordion body...</p></div></details>',
      assertCursor: [ [ 0, 0 ], 1 ],
    });
  });

  it('TINY-9730: Insert an accordion into a list item', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<ol><li>tiny</li></ol>',
      initialCursor: [ [ 0, 0, 0 ], 'tiny'.length ],
      assertContent: '<ol><li>tiny</li></ol><details class="mce-accordion"><summary class="mce-accordion-summary">Accordion summary...</summary>' +
        '<div class="mce-accordion-body"><p>Accordion body...</p></div></details>',
      assertCursor: [ [ 1, 0 ], 1 ],
    });
  });

  it('TINY-9730: Insert an accordion into a table cell', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<table><colgroup><col></colgroup><tbody><tr><td>&nbsp;</td></tr></tbody></table>',
      initialCursor: [ [ 0, 1, 0, 0, 0 ], 0 ],
      assertContent: '<table><colgroup><col></colgroup><tbody><tr><td>' +
        '<details class="mce-accordion"><summary class="mce-accordion-summary">Accordion summary...</summary>' +
        '<div class="mce-accordion-body"><p>Accordion body...</p></div></details></td></tr></tbody></table>',
      assertCursor: [ [ 0, 1, 0, 0, 0, 0 ], 1 ],
    });
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

  it('TINY-9730: Emit the "InsertAccordion" event', () => {
    const editor = hook.editor();
    editor.setContent('<p><br></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    let isEventTriggered = false;
    editor.on('InsertAccordion', () => {
      isEventTriggered = true;
    })
    editor.execCommand('InsertAccordion');
    assert.isTrue(isEventTriggered);
  });
});
