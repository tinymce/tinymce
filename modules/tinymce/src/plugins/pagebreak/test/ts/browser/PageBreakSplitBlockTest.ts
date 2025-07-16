import { ApproxStructure } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/pagebreak/Plugin';

describe('browser.tinymce.plugins.pagebreak.PageBreakSplitBlockTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'pagebreak',
    toolbar: 'pagebreak',
    pagebreak_split_block: false, // default
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const clickPageBreak = (editor: Editor) => TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Page break"]');

  it('TINY-3388: Pagebreak should insert inline when `pagebreak_split_block` is `false`', () => {
    const editor = hook.editor();
    editor.options.set('pagebreak_split_block', false);

    editor.setContent('<p>sometext</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);
    clickPageBreak(editor);

    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, arr) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('some')),
              s.element('img', {
                classes: [
                  arr.has('mce-pagebreak')
                ]
              }),
              s.text(str.is('text')),
            ]
          })
        ]
      });
    }));
  });

  it('TINY-3388: Pagebreak should split block element when `pagebreak_split_block` is `true`', () => {
    const editor = hook.editor();
    editor.options.set('pagebreak_split_block', true);

    editor.setContent('<p>sometext</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);
    clickPageBreak(editor);

    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, arr) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('some')),
            ]
          }),
          s.element('p', {
            children: [
              s.element('img', {
                classes: [
                  arr.has('mce-pagebreak')
                ]
              }),
            ]
          }),
          s.element('p', {
            children: [
              s.text(str.is('text')),
            ]
          })
        ]
      });
    }));
  });

  context('Editor content', () => {
    it('TINY-3388: source_view with `pagebreak_split_block=true`', () => {
      const editor = hook.editor();
      editor.options.set('pagebreak_split_block', true);

      editor.setContent('<p>sometext</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 4);
      clickPageBreak(editor);

      const content = editor.getContent({ source_view: true });
      // NOTE: p that wraps pagebreak is stripped
      assert.equal(content, `<p>some</p>\n<!-- pagebreak -->\n<p>text</p>`);
    });

    it('TINY-3388: source_view with `pagebreak_split_block=false`', () => {
      const editor = hook.editor();
      editor.options.set('pagebreak_split_block', false);

      editor.setContent('<p>sometext</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 4);
      clickPageBreak(editor);

      const content = editor.getContent({ source_view: true });
      assert.equal(content, `<p>some<!-- pagebreak -->text</p>`);
    });

    it('TINY-3388: getContent with `pagebreak_split_block=true`', () => {
      const editor = hook.editor();
      editor.options.set('pagebreak_split_block', true);

      editor.setContent('<p>sometext</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 4);
      clickPageBreak(editor);

      TinyAssertions.assertContent(editor, `<p>some</p>\n<!-- pagebreak -->\n<p>text</p>`);
    });

    it('TINY-3388: getContent with `pagebreak_split_block=false`', () => {
      const editor = hook.editor();
      editor.options.set('pagebreak_split_block', false);

      editor.setContent('<p>sometext</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 4);
      clickPageBreak(editor);

      TinyAssertions.assertContent(editor, '<p>some<!-- pagebreak -->text</p>');
    });
  });
});
