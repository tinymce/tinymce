import { Clipboard } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyAssertions, TinyDom, TinySelections } from '@ephox/wrap-mcagar';
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

  context('heading elements in summary', () => {
    it('TINY-10154: should apply heading formatting to summary content', () => {
      const editor = hook.editor();
      editor.setContent('<details><summary>hello<em>world</em></summary>body</details>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      editor.formatter.apply('h1');
      TinyAssertions.assertContent(editor, '<details><summary><h1>hello<em>world</em></h1></summary>body</details>');
    });

    it('TINY-10154: Should unwrap H1 element when inserting into summary element', () => {
      const editor = hook.editor();
      editor.setContent('<details><summary>helloworld</summary><div>body</div></details>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 'hello'.length);
      editor.insertContent('<h1>wonderful</h1>');
      TinyAssertions.assertContent(editor, '<details><summary>hellowonderfulworld</summary><div>body</div></details>');
    });

    it('TINY-10154: Should unwrap H1 element when inserting into summary element at the beginning', () => {
      const editor = hook.editor();
      editor.setContent('<details><summary>cd</summary><div>body</div></details><h1>a</h1><p>b</p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
      editor.insertContent('<h1>ab</h1>');
      TinyAssertions.assertContent(editor, '<details><summary>abcd</summary><div>body</div></details><h1>a</h1><p>b</p>');
    });

    it('TINY-10154: Should unwrap several heading elements when inserting into summary element', () => {
      const editor = hook.editor();
      editor.setContent('<details><summary>helloworld</summary><div>body</div></details>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
      editor.insertContent('<h5><em>wonder</em></h5><h4>ful</h4>');
      TinyAssertions.assertContent(editor, '<details><summary><em>wonder</em>fulhelloworld</summary><div>body</div></details>');
    });

    it('TINY-10154: Should keep formatting if summary contained heading element (insert at the beginning)', () => {
      const editor = hook.editor();
      editor.setContent('<details><summary><h4>world</h4></summary><div>body</div></details>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
      editor.insertContent('<h2>hello</h2>');
      TinyAssertions.assertContent(editor, '<details><summary><h4>helloworld</h4></summary><div>body</div></details>');
    });

    it('TINY-10154: Should keep formatting if summary contained heading element (insert in the middle)', () => {
      const editor = hook.editor();
      editor.setContent('<details><summary><h4>helloworld</h4></summary><div>body</div></details>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 'hello'.length);
      editor.insertContent('<h2>wonderful</h2>');
      TinyAssertions.assertContent(editor, '<details><summary><h4>hellowonderfulworld</h4></summary><div>body</div></details>');
    });

    it('TINY-10154: Should keep formatting if summary contained heading element (insert the same heading level h4)', () => {
      const editor = hook.editor();
      editor.setContent('<details><summary><h4>helloworld</h4></summary><div>body</div></details>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 'hello'.length);
      editor.insertContent('<h4>wonderful</h4>');
      TinyAssertions.assertContent(editor, '<details><summary><h4>hellowonderfulworld</h4></summary><div>body</div></details>');
    });

    it('TINY-10154: Should allow heading element in summary if it is the only child', () => {
      const editor = hook.editor();
      const content = '<details><summary><h2>helloworld</h2></summary><div>body</div></details>';
      editor.setContent(content);
      TinyAssertions.assertContent(editor, content);
    });

    it('TINY-10154: Should treat several headings in summary as invalid and unwrap it', () => {
      const editor = hook.editor();
      const content = '<details><summary><h2>hello</h2><h3><em>world</em></h3></summary><div>body</div></details>';
      editor.setContent(content);
      TinyAssertions.assertContent(editor, '<details><summary>hello<em>world</em></summary><div>body</div></details>');
    });

    it('TINY-10154: Should unwrap heading if it is not the only child of summary', () => {
      const editor = hook.editor();
      const content = '<details><summary><h2>helloworld</h2>GoodBye</summary><div>body</div></details>';
      editor.setContent(content);
      TinyAssertions.assertContent(editor, '<details><summary>helloworldGoodBye</summary><div>body</div></details>');
    });

    it('TINY-10154: should unwrap the heading element while pasting in summary', () => {
      const editor = hook.editor();
      editor.setContent('<details><summary><h4>helloworld</h4></summary><div>body</div></details>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 'hello'.length);
      Clipboard.pasteItems(TinyDom.body(editor), { 'text/html': '<h2>wonderful</h2>' });
      TinyAssertions.assertContent(editor, '<details><summary><h4>hellowonderfulworld</h4></summary><div>body</div></details>');
    });
  });
});
