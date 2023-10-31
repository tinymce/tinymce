import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyAssertions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/accordion/Plugin';

import type { ToggledAccordionEvent, ToggledAllAccordionsEvent } from '../../../main/ts/api/Events';
import * as AccordionUtils from '../module/AccordionUtils';

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

const testEvent = <T>(editor: Editor, eventName: string, cmd: string, callback: (event: T) => void, arg?: boolean): void => {
  let isEventTriggered = false;
  const fn = (event: T) => {
    isEventTriggered = true;
    callback(event);
  };
  editor.on(eventName, fn);
  editor.execCommand(cmd, false, arg);
  assert.isTrue(isEventTriggered);
  editor.off(eventName, fn);
};

describe('browser.tinymce.plugins.accordion.AccordionPluginTest', () => {
  const hook = TinyHooks.bddSetup<Editor>(
    {
      plugins: 'accordion',
      base_url: '/project/tinymce/js/tinymce',
      indent: false
    },
    [ Plugin ]
  );

  it('TINY-9730: Insert an accordion into a single paragraph', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<p>tiny</p>',
      initialCursor: [[ 0, 0 ], 'tiny'.length ],
      assertContent: '<p>tiny</p>' + AccordionUtils.createAccordion(),
      assertCursor: [[ 1, 0, 0 ], 'Accordion summary...'.length ],
    });
  });

  it('TINY-9730: Insert an accordion into an empty paragraph', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<p><br></p>',
      initialCursor: [[ 0, 0 ], 0 ],
      assertContent: AccordionUtils.createAccordion(),
      assertCursor: [[ 0, 0, 0 ], 'Accordion summary...'.length ],
    });
  });

  it('TINY-9730: Insert an accordion into a list item', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<ol><li>tiny</li></ol>',
      initialCursor: [[ 0, 0, 0 ], 'tiny'.length ],
      assertContent: `<ol><li>tiny${AccordionUtils.createAccordion()}</li></ol>`,
      assertCursor: [[ 0, 0, 1, 0, 0 ], 'Accordion summary...'.length ],
    });
  });

  it('TINY-9730: Insert an accordion into a dt tag', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<dl><dt>tiny</dt></dl>',
      initialCursor: [[ 0, 0, 0 ], 'tiny'.length ],
      assertContent: `<dl><dt>tiny${AccordionUtils.createAccordion()}</dt></dl>`,
      assertCursor: [[ 0, 0, 1, 0, 0 ], 'Accordion summary...'.length ],
    });
  });

  it('TINY-9730: Insert an accordion into a dd tag', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<dl><dd>tiny</dd></dl>',
      initialCursor: [[ 0, 0, 0 ], 'tiny'.length ],
      assertContent: `<dl><dd>tiny${AccordionUtils.createAccordion()}</dd></dl>`,
      assertCursor: [[ 0, 0, 1, 0, 0 ], 'Accordion summary...'.length ],
    });
  });

  it('TINY-9730: Insert an accordion into a table cell', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: '<table><colgroup><col></colgroup><tbody><tr><td>&nbsp;</td></tr></tbody></table>',
      initialCursor: [[ 0, 1, 0, 0, 0 ], 0 ],
      assertContent: `<table><colgroup><col></colgroup><tbody><tr><td>${AccordionUtils.createAccordion()}</td></tr></tbody></table>`,
      assertCursor: [[ 0, 1, 0, 0, 0, 0, 0 ], 'Accordion summary...'.length ],
    });
  });

  it('TINY-9730: Insert an accordion into an accordion body', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: AccordionUtils.createAccordion({ summary: 'summary', body: '<p>body</p>' }),
      initialCursor: [[ 0, 1, 0, 0 ], 'body'.length ],
      assertContent: AccordionUtils.createAccordion({ summary: 'summary', body: `<p>body</p>${AccordionUtils.createAccordion()}` }),
      assertCursor: [[ 0, 1, 1, 0, 0 ], 'Accordion summary...'.length ],
    });
  });

  it('TINY-9730: Do not insert an accordion inside another accordion if selection is in summary', () => {
    testInsertingAccordion(hook.editor(), {
      initialContent: AccordionUtils.createAccordion({ summary: 'title', body: '<p>body</p>' }),
      initialCursor: [[ 0, 0, 0 ], 'title'.length ],
      assertContent: AccordionUtils.createAccordion({ summary: 'title', body: '<p>body</p>' }),
      assertCursor: [[ 0, 0, 0 ], 'title'.length ],
    });
  });

  it('TINY-9730: Insert an accordion element inheriting the selected text', () => {
    const editor = hook.editor();
    editor.setContent('<p>tiny</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'tiny'.length);
    editor.execCommand('InsertAccordion');
    TinyAssertions.assertContent(editor, AccordionUtils.createAccordion({ summary: 'tiny' }));
    assert.equal(editor.selection.getNode().nodeName, 'SUMMARY');
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 'tiny'.length);
  });

  it('TINY-9731: Remove an accordion element under the cursor', () => {
    const editor = hook.editor();
    editor.setContent(`${AccordionUtils.createAccordion()}<p>tiny</p>`);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'tiny'.length);
    editor.execCommand('RemoveAccordion');
    TinyAssertions.assertContent(editor, '<p>tiny</p>');
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
  });

  it('TINY-9731: Toggle an accordion element under the cursor', () => {
    const editor = hook.editor();
    editor.setContent(`${AccordionUtils.createAccordion({ open: true })}<p>tiny</p>`);
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
    editor.setContent(`${AccordionUtils.createAccordion({ open: true })}<p>tiny</p>`);
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
    editor.setContent([ AccordionUtils.createAccordion({ open: true }), AccordionUtils.createAccordion({ open: true }) ].join(''));
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
    editor.setContent([ AccordionUtils.createAccordion({ open: true }), AccordionUtils.createAccordion({ open: true }) ].join(''));
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
    editor.setContent(AccordionUtils.createAccordion({ summary: 'tiny' }));
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
    editor.setContent([ AccordionUtils.createAccordion({ open: true }), AccordionUtils.createAccordion({ open: false }) ].join(''));
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'tiny'.length);
    testEvent(editor, 'ToggledAllAccordions', 'ToggleAllAccordions', (event: ToggledAllAccordionsEvent) => {
      assert.equal(event.elements.length, 2);
      assert.equal(event.elements[0].nodeName, 'DETAILS');
      assert.isUndefined(event.state);
    });
    testEvent(editor, 'ToggledAllAccordions', 'ToggleAllAccordions', (event: ToggledAllAccordionsEvent) => {
      assert.equal(event.elements.length, 2);
      assert.equal(event.elements[0].nodeName, 'DETAILS');
      assert.isUndefined(event.state);
    });
    testEvent(editor, 'ToggledAllAccordions', 'ToggleAllAccordions', (event: ToggledAllAccordionsEvent) => {
      assert.equal(event.elements.length, 2);
      assert.equal(event.elements[0].nodeName, 'DETAILS');
      assert.isTrue(event.state);
    }, true);
    testEvent(editor, 'ToggledAllAccordions', 'ToggleAllAccordions', (event: ToggledAllAccordionsEvent) => {
      assert.equal(event.elements.length, 2);
      assert.equal(event.elements[0].nodeName, 'DETAILS');
      assert.isFalse(event.state);
    }, false);
  });

  it('TINY-9760: Prevent inserting an accordion into noneditable elements', () => {
    const editor = hook.editor();
    editor.setContent('<div contenteditable="false"><p>noneditable</p></div>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    editor.execCommand('InsertAccordion');
    TinyAssertions.assertContentPresence(editor, { 'div[contenteditable="false"] > details': 0 });
  });
});
