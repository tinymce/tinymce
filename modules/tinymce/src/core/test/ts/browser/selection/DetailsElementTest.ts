import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyAssertions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

const createAccordion = (
  { open = true, summary = 'Accordion summary...', body = '<p>Accordion body...</p>' }:
  { open?: boolean; summary?: string; body?: string } = {}): string =>
  `<details class="mce-accordion"${open ? ` open="open"` : ''}><summary class="mce-accordion-summary">${summary}</summary>${body}</details>`;

describe('browser.tinymce.selection.DetailsElementTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('TINY-9731: Should not modify initial details if details_initial_state == inherited', () => {
    const editor = hook.editor();
    editor.options.set('details_initial_state', 'inherited');
    const content = [ createAccordion({ open: true }), createAccordion({ open: false }) ].join('');
    editor.setContent(content);
    TinyAssertions.assertContent(editor, content);
    editor.options.unset('details_initial_state');
  });

  it('TINY-9731: Should expand initial details if details_initial_state == expanded', () => {
    const editor = hook.editor();
    editor.options.set('details_initial_state', 'expanded');
    editor.setContent([ createAccordion({ open: true }), createAccordion({ open: false }) ].join(''));
    TinyAssertions.assertContent(editor, [ createAccordion({ open: true }), createAccordion({ open: true }) ].join(''));
    editor.options.unset('details_initial_state');
  });

  it('TINY-9731: Should collapse initial details if details_initial_state == collapsed', () => {
    const editor = hook.editor();
    editor.options.set('details_initial_state', 'collapsed');
    editor.setContent([ createAccordion({ open: true }), createAccordion({ open: false }) ].join(''));
    TinyAssertions.assertContent(editor, [ createAccordion({ open: false }), createAccordion({ open: false }) ].join(''));
    editor.options.unset('details_initial_state');
  });

  it('TINY-9731: Should not modify serialized details if details_serialized_state == inherited', () => {
    const editor = hook.editor();
    editor.options.set('details_serialized_state', 'inherited');
    const content = [ createAccordion({ open: true }), createAccordion({ open: false }) ].join('');
    editor.setContent(content);
    assert.equal(content, editor.getContent());
    editor.options.unset('details_serialized_state');
  });

  it('TINY-9731: Should expand serialized details if details_serialized_state == expanded', () => {
    const editor = hook.editor();
    editor.options.set('details_serialized_state', 'expanded');
    editor.setContent([ createAccordion({ open: true }), createAccordion({ open: false }) ].join(''));
    TinyAssertions.assertContent(editor, [ createAccordion({ open: true }), createAccordion({ open: true }) ].join(''));
    editor.options.unset('details_serialized_state');
  });

  it('TINY-9731: Should collapse serialized details if details_serialized_state == collapsed', () => {
    const editor = hook.editor();
    editor.options.set('details_serialized_state', 'collapsed');
    editor.setContent([ createAccordion({ open: true }), createAccordion({ open: false }) ].join(''));
    TinyAssertions.assertContent(editor, [ createAccordion({ open: false }), createAccordion({ open: false }) ].join(''));
    editor.options.unset('details_serialized_state');
  });

  it('TINY-9885: Should prevent 2 summaries appearing in details elements', () => {
    const editor = hook.editor();
    editor.setContent([ createAccordion({ summary: 'helloworld', body: '<p>body</p>', open: true }) ].join(''));
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'hello'.length);
    editor.execCommand('InsertHorizontalRule');
    TinyAssertions.assertContent(editor, createAccordion({ summary: 'hello', body: '<hr><p>world</p><p>body</p>', open: true }));
  });
});
