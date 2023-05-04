import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyContentActions, TinyAssertions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import type { ToggledAccordionEvent, ToggledAllAccordionsEvent } from '../../../main/ts/api/Events';
import AccordionPlugin from '../../../main/ts/Plugin';

const createAccordion = (
  { open = true, summary = 'Accordion summary...', body = '<p>Accordion body...</p>' }:
  { open?: boolean; summary?: string; body?: string } = {}): string =>
  `<details class="mce-accordion"${open ? ` open="open"` : ''}><summary class="mce-accordion-summary">${summary}</summary>${body}</details>`;

interface InsertAccordionTest {
  readonly initialContent: string;
  readonly initialCursor: [number[], number];
  readonly assertContent: string;
  readonly assertCursor: [number[], number];
}

const testInsertingAccordion = (editor: Editor, test: InsertAccordionTest): void => {
  editor.setContent(test.initialContent);
  TinySelections.setCursor(editor, ...test.initialCursor);
  editor.execCommand('InsertAccordion');
  TinyAssertions.assertContent(editor, test.assertContent);
  assert.equal(editor.selection.getNode().nodeName, 'SUMMARY');
  TinyAssertions.assertCursor(editor, ...test.assertCursor);
};

const testEvent = <T>(editor: Editor, eventName: string, cmd: string, callback: (event: T) => void): void => {
  let isEventTriggered = false;
  const fn = (event: T) => {
    isEventTriggered = true;
    callback(event);
  };
  editor.on(eventName, fn);
  editor.execCommand(cmd);
  assert.isTrue(isEventTriggered);
  editor.off(eventName, fn);
};

describe('browser.tinymce.plugins.accordion.AccordionPluginTest', () => {
  const hook = TinyHooks.bddSetup<Editor>(
    {
      plugins: 'accordion',
      indent: false,
      entities: 'raw',
      extended_valid_elements: 'details[class|open|data-mce-open],summary[class],div[class],p',
      base_url: '/project/tinymce/js/tinymce',
    },
    [ AccordionPlugin ]
  );

  it('TINY-9730: Insert an accordion into a single paragraph', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<p>tiny</p>',
      initialCursor: [[ 0, 0 ], 'tiny'.length ],
      assertContent: '<p>tiny</p>' + createAccordion(),
      assertCursor: [[ 1, 0 ], 1 ],
    });
  });

  it('TINY-9730: Insert an accordion into an empty paragraph', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<p><br></p>',
      initialCursor: [[ 0, 0 ], 0 ],
      assertContent: createAccordion(),
      assertCursor: [[ 0, 0 ], 1 ],
    });
  });

  it('TINY-9730: Insert an accordion into a list item', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<ol><li>tiny</li></ol>',
      initialCursor: [[ 0, 0, 0 ], 'tiny'.length ],
      assertContent: `<ol><li>tiny${createAccordion()}</li></ol>`,
      assertCursor: [[ 0, 0, 1, 0 ], 1 ],
    });
  });

  it('TINY-9730: Insert an accordion into a dt tag', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<dl><dt>tiny</dt></dl>',
      initialCursor: [[ 0, 0, 0 ], 'tiny'.length ],
      assertContent: `<dl><dt>tiny${createAccordion()}</dt></dl>`,
      assertCursor: [[ 0, 0, 1, 0 ], 1 ],
    });
  });

  it('TINY-9730: Insert an accordion into a dd tag', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<dl><dd>tiny</dd></dl>',
      initialCursor: [[ 0, 0, 0 ], 'tiny'.length ],
      assertContent: `<dl><dd>tiny${createAccordion()}</dd></dl>`,
      assertCursor: [[ 0, 0, 1, 0 ], 1 ],
    });
  });

  it('TINY-9730: Insert an accordion into a table cell', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<table><colgroup><col></colgroup><tbody><tr><td>&nbsp;</td></tr></tbody></table>',
      initialCursor: [[ 0, 1, 0, 0, 0 ], 0 ],
      assertContent: `<table><colgroup><col></colgroup><tbody><tr><td>${createAccordion()}</td></tr></tbody></table>`,
      assertCursor: [[ 0, 1, 0, 0, 0, 0 ], 1 ],
    });
  });

  it('TINY-9730: Insert an accordion into an accordion body', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: createAccordion({ summary: 'summary', body: '<p>body</p>' }),
      initialCursor: [[ 0, 1, 0 ], 'body'.length ],
      assertContent: createAccordion({ summary: 'summary', body: `<p>body</p>${createAccordion()}` }),
      assertCursor: [[ 0, 2, 0 ], 1 ],
    });
  });

  it('TINY-9730: Do not insert an accordion inside another accordion if selection is in summary', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: createAccordion({ summary: 'title', body: '<p>body</p>' }),
      initialCursor: [[ 0, 0, 0 ], 'title'.length ],
      assertContent: createAccordion({ summary: 'title', body: '<p>body</p>' }),
      assertCursor: [[ 0, 0, 0 ], 'title'.length ],
    });
  });

  it('TINY-9730: Insert an accordion element inheriting the selected text', () => {
    const editor = hook.editor();
    editor.setContent('<p>tiny</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'tiny'.length);
    editor.execCommand('InsertAccordion');
    TinyAssertions.assertContent(editor, createAccordion({ summary: 'tiny' }));
    assert.equal(editor.selection.getNode().nodeName, 'SUMMARY');
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
  });

  it('TINY-9731: Remove an accordion element under the cursor', () => {
    const editor = hook.editor();
    editor.setContent(`${createAccordion()}<p>tiny</p>`);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'tiny'.length);
    editor.execCommand('RemoveAccordion');
    TinyAssertions.assertContent(editor, '<p>tiny</p>');
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
  });

  it('TINY-9731: Toggle an accordion element under the cursor', () => {
    const editor = hook.editor();
    editor.setContent(`${createAccordion({ open: true })}<p>tiny</p>`);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('ToggleAccordion');
    TinyAssertions.assertContentPresence(editor, { 'details:not([open="open"])': 1 });
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('ToggleAccordion');
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1 });
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
  });

  it('TINY-9731: Toggle an accordion element under the cursor with an argument', () => {
    const editor = hook.editor();
    editor.setContent(`${createAccordion({ open: true })}<p>tiny</p>`);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('ToggleAccordion', false, false);
    TinyAssertions.assertContentPresence(editor, { 'details:not([open="open"])': 1 });
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('ToggleAccordion', false, true);
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1 });
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('ToggleAccordion', false, true);
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1 });
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
  });

  it('TINY-9731: Toggle all accordion elements', () => {
    const editor = hook.editor();
    editor.setContent([ createAccordion({ open: true }), createAccordion({ open: true }) ].join(''));
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('ToggleAllAccordions');
    TinyAssertions.assertContentPresence(editor, { 'details:not([open="open"])': 2 });
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('ToggleAllAccordions');
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 2 });
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
  });

  it('TINY-9731: Toggle all accordion elements with an argument', () => {
    const editor = hook.editor();
    editor.setContent([ createAccordion({ open: true }), createAccordion({ open: true }) ].join(''));
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('ToggleAllAccordions', false, false);
    TinyAssertions.assertContentPresence(editor, { 'details:not([open="open"])': 2 });
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('ToggleAllAccordions', false, true);
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 2 });
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('ToggleAllAccordions', false, true);
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 2 });
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
  });

  it('TINY-9731: Emit the "ToggledAccordion" event', () => {
    const editor = hook.editor();
    editor.setContent(createAccordion({ summary: 'tiny' }));
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'tiny'.length);
    testEvent(editor, 'ToggledAccordion', 'ToggleAccordion', (event: ToggledAccordionEvent) => {
      assert.equal(event.element.nodeName, 'DETAILS');
      assert.isFalse(event.state);
    });
    testEvent(editor, 'ToggledAccordion', 'ToggleAccordion', (event: ToggledAccordionEvent) => {
      assert.equal(event.element.nodeName, 'DETAILS');
      assert.isTrue(event.state);
    });
  });

  it('TINY-9731: Emit the "ToggledAllAccordions" event', () => {
    const editor = hook.editor();
    editor.setContent(createAccordion({ summary: 'tiny' }));
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'tiny'.length);
    testEvent(editor, 'ToggledAllAccordions', 'ToggleAllAccordions', (event: ToggledAllAccordionsEvent) => {
      assert.equal(event.elements.length, 1);
      assert.equal(event.elements[0].nodeName, 'DETAILS');
      assert.isFalse(event.state);
    });
    testEvent(editor, 'ToggledAllAccordions', 'ToggleAllAccordions', (event: ToggledAllAccordionsEvent) => {
      assert.equal(event.elements.length, 1);
      assert.equal(event.elements[0].nodeName, 'DETAILS');
      assert.isTrue(event.state);
    });
  });

  it('TINY-9731: Toggle summary with ENTER keypress', () => {
    const editor = hook.editor();
    editor.setContent(createAccordion({ summary: 'tiny' }));
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'tiny'.length);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, { 'details:not([open="open"])': 1 });
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1 });
  });

  it('TINY-9731: Leave accordion body with ENTER keypress within an empty paragraph', () => {
    const editor = hook.editor();
    editor.setContent(createAccordion({ body: '<p>tiny</p>' }));
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 'tiny'.length);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, { 'details > p': 2 });
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, { 'details > p': 1 });
    TinyAssertions.assertContentPresence(editor, { 'details + p': 1 });
    TinyAssertions.assertCursor(editor, [ 1 ], 0);
  });

  it('TINY-9731: Do not remove the only empty paragraph when leaving accordion body with ENTER keypress', () => {
    const editor = hook.editor();
    editor.setContent(createAccordion({ body: '<p></p>' }));
    TinySelections.setCursor(editor, [ 0, 1 ], 0);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, { 'details > p': 1 });
    TinyAssertions.assertContentPresence(editor, { 'details + p': 1 });
    TinyAssertions.assertCursor(editor, [ 1 ], 0);
  });

  it('TINY-9731: Leave accordion body with ENTER keypress within an empty paragraph for deprecated details', () => {
    const editor = hook.editor();
    editor.setContent(`<details open="open"><summary>summary</summary><p>tiny</p></details>`);
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 'tiny'.length);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, { 'details > p': 2 });
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, { 'details > p': 1 });
    TinyAssertions.assertContentPresence(editor, { 'details + p': 1 });
    TinyAssertions.assertCursor(editor, [ 1 ], 0);
  });

  it('TINY-9731: Prevent BACKSPACE from removing accordion body', () => {
    const editor = hook.editor();
    editor.setContent(createAccordion({ body: '<p><br/></p>' }) + '<p><br/></p>');
    TinySelections.setCursor(editor, [ 1, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContentPresence(editor, { 'details > p': 1 });
    TinyAssertions.assertCursor(editor, [ 0, 1 ], 0);
  });
});
