import { ApproxStructure, StructAssert, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Type, Unicode } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/accordion/Plugin';

import * as AccordionUtils from '../module/AccordionUtils';

interface AccordionDetails {
  readonly open?: boolean;
  readonly summary?: string;
  readonly body?: string[];
  readonly isSelected?: boolean;
}

interface ContentStructure {
  readonly accordion: ApproxStructure.Builder<StructAssert>;
  readonly before?: ApproxStructure.Builder<StructAssert>;
  readonly after?: ApproxStructure.Builder<StructAssert>;
}

describe('browser.tinymce.plugins.accordion.FilterContentTest', () => {
  const browser = PlatformDetection.detect().browser;
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'accordion',
    toolbar: 'accordion',
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Plugin ], true);

  const buildAccordionStructure = (details: AccordionDetails): ApproxStructure.Builder<StructAssert> => (s, str, _arr) => {
    const { open, summary, body, isSelected } = details;
    return s.element('details', {
      exactClasses: [ 'mce-accordion' ],
      exactAttrs: {
        ...Type.isNullable(open) || open === true ? { open: str.is('open') } : {},
        ...Type.isNullable(isSelected) || isSelected === true ? { 'data-mce-selected': str.is('1') } : {}
      },
      children: [
        s.element('summary', {
          exactClasses: [ 'mce-accordion-summary' ],
          children: [
            ApproxStructure.fromHtml(summary || 'Accordion summary...')
          ]
        }),
        s.element('div', {
          exactClasses: [ 'mce-accordion-body' ],
          children: (body ?? [ '<p>Accordion body...</p>' ]).map((html) => ApproxStructure.fromHtml(html))
        })
      ]
    });
  };

  const buildContentStructure = (contentStructure: ContentStructure) => {
    const { before, accordion, after } = contentStructure;
    return ApproxStructure.build((s, str, arr) => {
      const beforeStruct = Type.isNonNullable(before) ? [ before(s, str, arr) ] : [];
      const accordionStruct = [ accordion(s, str, arr) ];
      const afterStruct = Type.isNonNullable(after) ? [ after(s, str, arr) ] : [];
      return s.element('body', {
        children: [
          ...beforeStruct,
          ...accordionStruct,
          ...afterStruct
        ]
      });
    });
  };

  context('parsing', () => {
    it('TINY-9959: should have correct structure when inserting with toolbar button', () => {
      const editor = hook.editor();

      editor.setContent('');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert accordion"]');
      TinyAssertions.assertContentStructure(
        editor,
        buildContentStructure({
          accordion: buildAccordionStructure({})
        })
      );
    });

    it('TINY-9959: should have correct structure when inserting with command', async () => {
      const editor = hook.editor();

      editor.setContent('');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      editor.execCommand('InsertAccordion');
      // Occasionally the data-mce-selected attribute is not on the details element immediately
      // so wrapping the assertion in a Waiter
      await Waiter.pTryUntil('Should have correct structure and accordion should be selected', () => {
        TinyAssertions.assertContentStructure(
          editor,
          buildContentStructure({
            accordion: buildAccordionStructure({})
          })
        );
      });
    });

    it('TINY-9959: should have correct structure when selecting text and inserting accordion', () => {
      const editor = hook.editor();

      editor.setContent('<p>blah1 Test blah2</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 'blah1 '.length, [ 0, 0 ], 'blah1 Test'.length);

      editor.execCommand('InsertAccordion');
      TinyAssertions.assertContentStructure(
        editor,
        buildContentStructure({
          before: () => ApproxStructure.fromHtml(`<p>blah1${browser.isSafari() ? ' ' : Unicode.nbsp}</p>`),
          accordion: buildAccordionStructure({
            summary: 'Test'
          }),
          after: () => ApproxStructure.fromHtml(`<p>${browser.isSafari() ? Unicode.nbsp : ' '}blah2</p>`),
        })
      );
    });

    it('TINY-9959: should have correct structure when inserting basic accordion with setContent', () => {
      const editor = hook.editor();

      editor.setContent('<p>before</p>' + AccordionUtils.createAccordion({}));
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      TinyAssertions.assertContentStructure(
        editor,
        buildContentStructure({
          before: () => ApproxStructure.fromHtml('<p>before</p>'),
          accordion: buildAccordionStructure({
            isSelected: false
          }),
        })
      );
    });

    it('TINY-9959: should have correct structure when inserting basic accordion that is not open', () => {
      const editor = hook.editor();

      editor.setContent('<p>before</p>' + AccordionUtils.createAccordion({ open: false }));
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      TinyAssertions.assertContentStructure(
        editor,
        buildContentStructure({
          before: () => ApproxStructure.fromHtml('<p>before</p>'),
          accordion: buildAccordionStructure({
            open: false,
            isSelected: false
          }),
        })
      );
    });

    it('TINY-9959: should have correct structure when inserting accordion with formatting and headings', () => {
      const editor = hook.editor();

      editor.setContent('<p>before</p>' + AccordionUtils.createAccordion({
        body: '<p><strong>First</strong></p><h2>Second</h2>'
      }));
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      TinyAssertions.assertContentStructure(
        editor,
        buildContentStructure({
          before: () => ApproxStructure.fromHtml('<p>before</p>'),
          accordion: buildAccordionStructure({
            isSelected: false,
            body: [ '<p><strong>First</strong></p>', '<h2>Second</h2>' ]
          }),
        })
      );
    });

    it('TINY-9959: should have correct structure when inserting accordion where summary has no content', () => {
      const editor = hook.editor();

      editor.setContent(
        '<p>before</p>' +
        `<details class="mce-accordion" open="open"><summary></summary><p>bar</p></details>`
      );
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      TinyAssertions.assertContentStructure(
        editor,
        buildContentStructure({
          before: () => ApproxStructure.fromHtml('<p>before</p>'),
          accordion: buildAccordionStructure({
            summary: '<br data-mce-bogus="1">',
            body: [ '<p>bar</p>' ],
            isSelected: false,
          }),
        })
      );
    });

    it('TINY-9959: should have correct structure when inserting accordion where summary is not the first child', () => {
      const editor = hook.editor();

      editor.setContent(
        '<p>before</p>' +
        `<details class="mce-accordion" open="open"><p>bar</p><summary>foo</summary></details>`
      );
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      TinyAssertions.assertContentStructure(
        editor,
        buildContentStructure({
          before: () => ApproxStructure.fromHtml('<p>before</p>'),
          accordion: buildAccordionStructure({
            summary: 'foo',
            body: [ '<p>bar</p>' ],
            isSelected: false,
          }),
        })
      );
    });

    it('TINY-9959: should have correct structure when inserting accordion with multiple summary elements', () => {
      const editor = hook.editor();

      editor.setContent(
        '<p>before</p>' +
        `<details class="mce-accordion" open="open"><summary>foo</summary><p>bar</p><summary>baz</summary></details>`
      );
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      TinyAssertions.assertContentStructure(
        editor,
        buildContentStructure({
          before: () => ApproxStructure.fromHtml('<p>before</p>'),
          accordion: buildAccordionStructure({
            summary: 'foo',
            body: [ '<p>bar</p>', '<summary>baz</summary>' ],
            isSelected: false,
          }),
        })
      );
    });

    it('TINY-9959: should have correct structure when inserting accordion with only a summary element', () => {
      const editor = hook.editor();

      editor.setContent(
        '<p>before</p>' +
        `<details class="mce-accordion" open="open"><summary>foo</summary></details>`
      );
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      TinyAssertions.assertContentStructure(
        editor,
        buildContentStructure({
          before: () => ApproxStructure.fromHtml('<p>before</p>'),
          accordion: buildAccordionStructure({
            summary: 'foo',
            body: [ '<p><br data-mce-bogus="1"></p>' ],
            // body: [ '<br data-mce-bogus="1">' ],
            isSelected: false,
          }),
        })
      );
    });

    it('TINY-9959: should have correct structure when inserting accordion with no summary element', () => {
      const editor = hook.editor();

      editor.setContent(
        '<p>before</p>' +
        `<details class="mce-accordion" open="open"><p>foo</p></details>`
      );
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      TinyAssertions.assertContentStructure(
        editor,
        buildContentStructure({
          before: () => ApproxStructure.fromHtml('<p>before</p>'),
          accordion: buildAccordionStructure({
            summary: '<br data-mce-bogus="1">',
            body: [ '<p>foo</p>' ],
            isSelected: false,
          }),
        })
      );
    });

    it('TINY-9959: should have correct structure when inserting accordion with no children', () => {
      const editor = hook.editor();

      editor.setContent(
        '<p>before</p>' +
        `<details class="mce-accordion" open="open"></details>`
      );
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      TinyAssertions.assertContentStructure(
        editor,
        buildContentStructure({
          before: () => ApproxStructure.fromHtml('<p>before</p>'),
          accordion: buildAccordionStructure({
            summary: '<br data-mce-bogus="1">',
            body: [ '<p><br data-mce-bogus="1"></p>' ],
            isSelected: false,
          }),
        })
      );
    });

    it('TINY-9959: should have correct structure when inserting accordion with empty children', () => {
      const editor = hook.editor();

      editor.setContent(
        '<p>before</p>' +
        `<details class="mce-accordion" open="open"><summary></summary><h2></h2></details>`
      );
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      TinyAssertions.assertContentStructure(
        editor,
        buildContentStructure({
          before: () => ApproxStructure.fromHtml('<p>before</p>'),
          accordion: buildAccordionStructure({
            summary: '<br data-mce-bogus="1">',
            body: [ '<h2><br data-mce-bogus="1"></h2>' ],
            isSelected: false,
          }),
        })
      );
    });
  });

  context('serialization', () => {
    it('TINY-9959: should have correct structure when inserting with toolbar button', () => {
      const editor = hook.editor();

      editor.setContent('');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert accordion"]');
      TinyAssertions.assertContent(editor, AccordionUtils.createAccordion({}));
    });

    it('TINY-9959: should have correct structure when inserting with command', () => {
      const editor = hook.editor();

      editor.setContent('');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      editor.execCommand('InsertAccordion');
      TinyAssertions.assertContent(editor, AccordionUtils.createAccordion({}));
    });

    it('TINY-9959: should have correct structure when summary has no content', () => {
      const editor = hook.editor();

      editor.setContent('');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      editor.execCommand('InsertAccordion');
      TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 'Accordion summary...'.length);

      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 'Accordion summary...'.length);
      editor.execCommand('Delete');
      TinyAssertions.assertContent(editor, AccordionUtils.createAccordion({ summary: '&nbsp;' }));
    });
  });
});
